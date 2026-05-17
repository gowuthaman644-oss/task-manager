const Task = require('../models/Task');
const { validationResult } = require('express-validator');

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
    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
    if (!task) return res.status(404).json({ success: false, message: 'Task not found.' });
    res.status(200).json({ success: true, task });
  } catch (error) { next(error); }
};

const createTask = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, message: errors.array()[0].msg });

    const task = await Task.create({ ...req.body, user: req.user._id });
    
    emitToUser(req, 'task_created', task); // Emit event
    
    res.status(201).json({ success: true, message: 'Task created successfully!', task });
  } catch (error) { next(error); }
};

const updateTask = async (req, res, next) => {
  try {
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
    const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!task) return res.status(404).json({ success: false, message: 'Task not found.' });
    
    emitToUser(req, 'task_deleted', req.params.id); // Emit event
    
    res.status(200).json({ success: true, message: 'Task deleted successfully!' });
  } catch (error) { next(error); }
};

const getStats = async (req, res, next) => {
  try {
    const userId = req.user._id;
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
