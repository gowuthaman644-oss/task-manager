const mongoose = require('mongoose');
const Task = require('../models/Task');
const { validationResult } = require('express-validator');

// Stateful in-memory mock tasks store fallback for stateless serverless environments (Vercel)
let inMemoryTasks = [];

const initInMemoryTasks = (userId) => {
  if (inMemoryTasks.length > 0) return;
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);

  inMemoryTasks = [
    {
      _id: 'task1',
      title: '🚀 Explore the TaskFlow Dashboard',
      description: 'Take a tour of TaskFlow\'s premium glassmorphism user interface. Check out the statistics widgets and completion metrics!',
      status: 'completed',
      priority: 'urgent',
      category: 'work',
      dueDate: today.toISOString(),
      progress: 100,
      user: userId,
      completedAt: now,
      createdAt: now,
    },
    {
      _id: 'task2',
      title: '📊 Analyze your productivity trends',
      description: 'Navigate to the Analytics page to view your completion rate, priority breakdowns, and productivity trends.',
      status: 'in-progress',
      priority: 'high',
      category: 'finance',
      dueDate: tomorrow.toISOString(),
      progress: 60,
      user: userId,
      createdAt: now,
    },
    {
      _id: 'task3',
      title: '⚡ Test real-time live synchronization',
      description: 'Open a different browser tab, login, and try creating or modifying tasks to see live synchronization across screens via WebSockets!',
      status: 'todo',
      priority: 'medium',
      category: 'education',
      dueDate: tomorrow.toISOString(),
      progress: 0,
      user: userId,
      createdAt: now,
    },
    {
      _id: 'task4',
      title: '📅 Plot tasks on the Calendar view',
      description: 'Try adding due dates to your tasks and view them beautifully arranged inside the responsive monthly Calendar grid.',
      status: 'todo',
      priority: 'low',
      category: 'personal',
      dueDate: tomorrow.toISOString(),
      progress: 0,
      user: userId,
      createdAt: now,
    },
    {
      _id: 'task5',
      title: '🚫 Complete overdue tasks',
      description: 'This is an older task that was due yesterday and has become overdue. The navigation bar will alert you of overdue tasks!',
      status: 'todo',
      priority: 'urgent',
      category: 'work',
      dueDate: yesterday.toISOString(),
      progress: 10,
      user: userId,
      createdAt: now,
    }
  ];
};

// Helper to emit events via Socket.io
const emitToUser = (req, eventName, data) => {
  const io = req.app.get('io');
  if (io) {
    io.to(req.user._id.toString()).emit(eventName, data);
  }
};

const getTasks = async (req, res, next) => {
  try {
    const { status, priority, category, search, sort = '-createdAt', page = 1, limit = 50 } = req.query;

    // Zero-config Serverless Fallback
    if (mongoose.connection.readyState !== 1) {
      initInMemoryTasks(req.user._id.toString());
      let filtered = [...inMemoryTasks];
      if (status) filtered = filtered.filter(t => t.status === status);
      if (priority) filtered = filtered.filter(t => t.priority === priority);
      if (category) filtered = filtered.filter(t => t.category === category);
      if (search) {
        const q = search.toLowerCase();
        filtered = filtered.filter(t => t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q));
      }
      
      // Sorting
      if (sort === 'dueDate') filtered.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
      else if (sort === '-dueDate') filtered.sort((a, b) => new Date(b.dueDate) - new Date(a.dueDate));
      else if (sort === '-createdAt') filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      return res.status(200).json({ success: true, count: filtered.length, total: filtered.length, page: 1, pages: 1, tasks: filtered });
    }

    const filter = { user: req.user._id };
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (category) filter.category = category;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Task.countDocuments(filter);
    const tasks = await Task.find(filter).sort(sort).skip(skip).limit(parseInt(limit));

    res.status(200).json({ success: true, count: tasks.length, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)), tasks });
  } catch (error) { next(error); }
};

const getTask = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      initInMemoryTasks(req.user._id.toString());
      const task = inMemoryTasks.find(t => t._id === req.params.id);
      if (!task) return res.status(404).json({ success: false, message: 'Task not found.' });
      return res.status(200).json({ success: true, task });
    }

    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
    if (!task) return res.status(404).json({ success: false, message: 'Task not found.' });
    res.status(200).json({ success: true, task });
  } catch (error) { next(error); }
};

const createTask = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, message: errors.array()[0].msg });

    if (mongoose.connection.readyState !== 1) {
      const newTask = {
        _id: 'task_' + Math.random().toString(36).substr(2, 9),
        ...req.body,
        user: req.user._id.toString(),
        createdAt: new Date()
      };
      inMemoryTasks.unshift(newTask);
      emitToUser(req, 'task_created', newTask);
      return res.status(201).json({ success: true, message: 'Task created successfully!', task: newTask });
    }

    const task = await Task.create({ ...req.body, user: req.user._id });
    emitToUser(req, 'task_created', task); // Emit event
    res.status(201).json({ success: true, message: 'Task created successfully!', task });
  } catch (error) { next(error); }
};

const updateTask = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      initInMemoryTasks(req.user._id.toString());
      const task = inMemoryTasks.find(t => t._id === req.params.id);
      if (!task) return res.status(404).json({ success: false, message: 'Task not found.' });

      const allowedFields = ['title', 'description', 'status', 'priority', 'category', 'dueDate', 'tags', 'progress'];
      allowedFields.forEach((field) => { if (req.body[field] !== undefined) task[field] = req.body[field]; });
      if (task.status === 'completed') task.completedAt = new Date();

      emitToUser(req, 'task_updated', task);
      return res.status(200).json({ success: true, message: 'Task updated successfully!', task });
    }

    let task = await Task.findOne({ _id: req.params.id, user: req.user._id });
    if (!task) return res.status(404).json({ success: false, message: 'Task not found.' });

    const allowedFields = ['title', 'description', 'status', 'priority', 'category', 'dueDate', 'tags', 'progress'];
    allowedFields.forEach((field) => { if (req.body[field] !== undefined) task[field] = req.body[field]; });

    await task.save();
    emitToUser(req, 'task_updated', task); // Emit event
    res.status(200).json({ success: true, message: 'Task updated successfully!', task });
  } catch (error) { next(error); }
};

const deleteTask = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      initInMemoryTasks(req.user._id.toString());
      const index = inMemoryTasks.findIndex(t => t._id === req.params.id);
      if (index === -1) return res.status(404).json({ success: false, message: 'Task not found.' });
      inMemoryTasks.splice(index, 1);
      emitToUser(req, 'task_deleted', req.params.id);
      return res.status(200).json({ success: true, message: 'Task deleted successfully!' });
    }

    const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!task) return res.status(404).json({ success: false, message: 'Task not found.' });
    
    emitToUser(req, 'task_deleted', req.params.id); // Emit event
    res.status(200).json({ success: true, message: 'Task deleted successfully!' });
  } catch (error) { next(error); }
};

const getStats = async (req, res, next) => {
  try {
    const userId = req.user._id;

    if (mongoose.connection.readyState !== 1) {
      initInMemoryTasks(userId.toString());
      const now = new Date();
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const endOfToday = new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000);

      const total = inMemoryTasks.length;
      const byStatus = { todo: 0, 'in-progress': 0, completed: 0, cancelled: 0 };
      const byPriority = { low: 0, medium: 0, high: 0, urgent: 0 };
      const byCategory = { work: 0, personal: 0, shopping: 0, finance: 0, education: 0, health: 0, other: 0 };
      let overdue = 0;
      let dueToday = 0;
      let completedThisWeek = 0;

      inMemoryTasks.forEach(t => {
        if (byStatus[t.status] !== undefined) byStatus[t.status]++;
        if (byPriority[t.priority] !== undefined) byPriority[t.priority]++;
        if (byCategory[t.category] !== undefined) byCategory[t.category]++;

        const due = new Date(t.dueDate);
        if (t.status !== 'completed' && t.status !== 'cancelled') {
          if (due < now) overdue++;
          if (due >= startOfToday && due < endOfToday) dueToday++;
        }
        if (t.completedAt && new Date(t.completedAt) >= new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)) {
          completedThisWeek++;
        }
      });

      return res.status(200).json({
        success: true,
        stats: {
          total,
          byStatus,
          byPriority,
          byCategory,
          overdue,
          dueToday,
          completedThisWeek,
          completionRate: total > 0 ? Math.round(((byStatus.completed || 0) / total) * 100) : 0
        }
      });
    }

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000);

    const [statusCounts, priorityCounts, categoryCounts, overdue, dueToday, completedThisWeek] = await Promise.all([
      Task.aggregate([{ $match: { user: userId } }, { $group: { _id: '$status', count: { $sum: 1 } } }]),
      Task.aggregate([{ $match: { user: userId } }, { $group: { _id: '$priority', count: { $sum: 1 } } }]),
      Task.aggregate([{ $match: { user: userId } }, { $group: { _id: '$category', count: { $sum: 1 } } }]),
      Task.countDocuments({ user: userId, dueDate: { $lt: now }, status: { $nin: ['completed', 'cancelled'] } }),
      Task.countDocuments({ user: userId, dueDate: { $gte: startOfToday, $lt: endOfToday }, status: { $nin: ['completed', 'cancelled'] } }),
      Task.countDocuments({ user: userId, completedAt: { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) } }),
    ]);

    const total = await Task.countDocuments({ user: userId });
    const byStatus = {}; statusCounts.forEach((s) => (byStatus[s._id] = s.count));
    const byPriority = {}; priorityCounts.forEach((p) => (byPriority[p._id] = p.count));
    const byCategory = {}; categoryCounts.forEach((c) => (byCategory[c._id] = c.count));

    res.status(200).json({
      success: true,
      stats: { total, byStatus, byPriority, byCategory, overdue, dueToday, completedThisWeek, completionRate: total > 0 ? Math.round(((byStatus.completed || 0) / total) * 100) : 0 },
    });
  } catch (error) { next(error); }
};

module.exports = { getTasks, getTask, createTask, updateTask, deleteTask, getStats };
