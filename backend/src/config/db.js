const mongoose = require('mongoose');
const User = require('../models/User');
const Task = require('../models/Task');

const seedDemoData = async () => {
  try {
    const demoEmail = 'demo@taskflow.com';
    const existingDemo = await User.findOne({ email: demoEmail });

    if (!existingDemo) {
      console.log('🌱 Seeding default Demo User...');
      const demoUser = await User.create({
        name: 'Demo User',
        email: demoEmail,
        password: 'demo123',
        avatar: '',
      });

      console.log('🌱 Seeding default sample tasks for Demo User...');
      
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
      const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);

      await Task.create([
        {
          title: '🚀 Explore the TaskFlow Dashboard',
          description: 'Take a tour of TaskFlow\'s premium glassmorphism user interface. Check out the statistics widgets and completion metrics!',
          status: 'completed',
          priority: 'urgent',
          category: 'work',
          dueDate: today,
          progress: 100,
          user: demoUser._id,
          completedAt: now,
        },
        {
          title: '📊 Analyze your productivity trends',
          description: 'Navigate to the Analytics page to view your completion rate, priority breakdowns, and productivity trends.',
          status: 'in-progress',
          priority: 'high',
          category: 'finance',
          dueDate: tomorrow,
          progress: 60,
          user: demoUser._id,
        },
        {
          title: '⚡ Test real-time live synchronization',
          description: 'Open a different browser tab, login, and try creating or modifying tasks to see live synchronization across screens via WebSockets!',
          status: 'todo',
          priority: 'medium',
          category: 'education',
          dueDate: tomorrow,
          progress: 0,
          user: demoUser._id,
        },
        {
          title: '📅 Plot tasks on the Calendar view',
          description: 'Try adding due dates to your tasks and view them beautifully arranged inside the responsive monthly Calendar grid.',
          status: 'todo',
          priority: 'low',
          category: 'personal',
          dueDate: tomorrow,
          progress: 0,
          user: demoUser._id,
        },
        {
          title: '🚫 Complete overdue tasks',
          description: 'This is an older task that was due yesterday and has become overdue. The navigation bar will alert you of overdue tasks!',
          status: 'todo',
          priority: 'urgent',
          category: 'work',
          dueDate: yesterday,
          progress: 10,
          user: demoUser._id,
        }
      ]);
      console.log('✅ Seeding completed successfully!');
    }
  } catch (error) {
    console.error(`⚠️ Database seeding failed: ${error.message}`);
  }
};

const connectDB = async () => {
  try {
    console.log('🔄 Attempting connection to MongoDB...');
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    await seedDemoData();
  } catch (error) {
    console.warn(`⚠️ Failed to connect to local MongoDB database: ${error.message}`);
    console.log('⚡ Initializing automatic In-Memory MongoDB Server fallback...');

    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongoServer = await MongoMemoryServer.create();
      const mongoUri = mongoServer.getUri();

      console.log(`🚀 Starting in-memory MongoDB instance...`);
      const conn = await mongoose.connect(mongoUri);
      console.log(`✅ Success! Connected to In-Memory MongoDB: ${conn.connection.host}`);
      console.log('💡 Note: Data will be persisted in-memory for this session only.');
      await seedDemoData();
    } catch (fallbackError) {
      console.error(`❌ Failed to start In-Memory MongoDB Server: ${fallbackError.message}`);
      process.exit(1);
    }
  }
};

module.exports = connectDB;
