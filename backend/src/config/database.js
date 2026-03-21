const mongoose = require('mongoose');

// 默认 MongoDB 连接地址
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/blog';

const connectDB = async () => {
  try {
    console.log('🔄 Connecting to MongoDB...');
    console.log(`   URI: ${MONGODB_URI.replace(/\/\/.*@/, '//***@')}`); // 隐藏密码

    const conn = await mongoose.connect(MONGODB_URI, {
      maxPoolSize: 10,
      minPoolSize: 2,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

    // 监听连接事件
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB reconnected');
    });

  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    console.error('   请确保 MongoDB 已启动并运行在 localhost:27017');
    console.error('   或在 .env 文件中配置 MONGODB_URI');
    process.exit(1);
  }
};

module.exports = connectDB;
