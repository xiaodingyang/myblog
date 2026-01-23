/**
 * 数据库种子脚本
 * 用于初始化测试数据
 * 
 * 运行方式: node src/scripts/seed.js
 */

// 尝试加载环境变量
try {
  require('dotenv').config();
} catch (e) {
  // dotenv 可能不存在，忽略
}

const mongoose = require('mongoose');
const { User, Category, Tag, Article, Message } = require('../models');

// 默认 MongoDB 连接地址
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/blog';

const seedData = async () => {
  try {
    // 连接数据库
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB Connected');

    // 清空数据
    console.log('🗑️  Clearing existing data...');
    await Promise.all([
      User.deleteMany({}),
      Category.deleteMany({}),
      Tag.deleteMany({}),
      Article.deleteMany({}),
      Message.deleteMany({}),
    ]);

    // 创建管理员用户
    console.log('👤 Creating admin user...');
    const admin = await User.create({
      username: 'admin',
      email: 'admin@example.com',
      password: 'admin123',
      role: 'admin',
    });

    // 创建分类
    console.log('📁 Creating categories...');
    const categories = await Category.create([
      { name: '前端开发', description: 'HTML、CSS、JavaScript、React、Vue等前端技术' },
      { name: '后端开发', description: 'Node.js、Python、Java、数据库等后端技术' },
      { name: '技术随笔', description: '技术感悟、学习心得、职业发展' },
      { name: '开源项目', description: '开源项目介绍与实践' },
    ]);

    // 创建标签
    console.log('🏷️  Creating tags...');
    const tags = await Tag.create([
      { name: 'React' },
      { name: 'TypeScript' },
      { name: 'Node.js' },
      { name: 'Vue' },
      { name: 'CSS' },
      { name: 'JavaScript' },
      { name: 'MongoDB' },
      { name: 'Express' },
      { name: 'Webpack' },
      { name: 'Git' },
    ]);

    // 创建文章
    console.log('📝 Creating articles...');
    const articles = await Article.create([
      {
        title: 'React 18 新特性详解',
        content: `# React 18 新特性详解

React 18 带来了许多令人兴奋的新特性，本文将详细介绍这些更新。

## Concurrent Mode（并发模式）

并发模式是 React 18 最重要的更新。它允许 React 同时准备多个版本的 UI。

### 主要优势

- 更流畅的用户体验
- 更好的性能优化
- 自动批处理更新

## Automatic Batching（自动批处理）

React 18 引入了自动批处理，可以将多个状态更新合并为一次重新渲染。

\`\`\`jsx
function handleClick() {
  setCount(c => c + 1);
  setFlag(f => !f);
  // React 会将它们批处理为一次重新渲染
}
\`\`\`

## 总结

React 18 的这些新特性将大大提升应用的性能和用户体验。`,
        summary: 'React 18 带来了并发模式、自动批处理、Suspense 改进等新特性，本文详细介绍这些更新。',
        cover: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800',
        category: categories[0]._id,
        tags: [tags[0]._id, tags[1]._id, tags[5]._id],
        author: admin._id,
        status: 'published',
        views: 1280,
      },
      {
        title: 'TypeScript 高级类型技巧',
        content: `# TypeScript 高级类型技巧

掌握 TypeScript 高级类型可以让你的代码更加健壮和类型安全。

## 条件类型

\`\`\`typescript
type IsString<T> = T extends string ? true : false;
\`\`\`

## 映射类型

\`\`\`typescript
type Readonly<T> = {
  readonly [K in keyof T]: T[K];
};
\`\`\`

## 总结

这些高级类型技巧可以帮助你写出更加类型安全的代码。`,
        summary: '深入探讨 TypeScript 中的高级类型用法，包括条件类型、映射类型、工具类型等。',
        cover: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800',
        category: categories[0]._id,
        tags: [tags[1]._id, tags[5]._id],
        author: admin._id,
        status: 'published',
        views: 856,
      },
      {
        title: 'Node.js 性能优化实践',
        content: `# Node.js 性能优化实践

本文总结了 Node.js 应用性能优化的关键技巧。

## 使用集群（Cluster）

Node.js 是单线程的，使用集群可以充分利用多核 CPU。

## 异步编程最佳实践

- 使用 async/await 而非回调
- 避免同步操作阻塞事件循环

## 总结

性能优化是一个持续的过程，需要根据实际情况不断调整。`,
        summary: '分享 Node.js 应用性能优化的实战经验，包括集群、内存管理、异步优化等。',
        cover: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800',
        category: categories[1]._id,
        tags: [tags[2]._id, tags[5]._id, tags[7]._id],
        author: admin._id,
        status: 'published',
        views: 634,
      },
      {
        title: 'CSS Grid 布局完全指南',
        content: `# CSS Grid 布局完全指南

CSS Grid 是现代网页布局的利器。

## 基础概念

\`\`\`css
.container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}
\`\`\`

## 总结

Grid 布局提供了强大的二维布局能力。`,
        summary: '全面介绍 CSS Grid 布局系统，从基础概念到高级用法。',
        cover: 'https://images.unsplash.com/photo-1507721999472-8ed4421c4af2?w=800',
        category: categories[0]._id,
        tags: [tags[4]._id],
        author: admin._id,
        status: 'published',
        views: 445,
      },
    ]);

    // 创建留言
    console.log('💬 Creating messages...');
    await Message.create([
      {
        nickname: '张三',
        email: 'zhangsan@example.com',
        content: '博客写得很好，学到很多！',
        status: 'approved',
      },
      {
        nickname: '李四',
        email: 'lisi@example.com',
        content: '希望能多写一些 React 相关的文章',
        status: 'approved',
      },
      {
        nickname: '王五',
        email: 'wangwu@example.com',
        content: '文章内容深入浅出，非常棒！',
        status: 'pending',
      },
    ]);

    console.log('\n✅ Seed data created successfully!');
    console.log('\n📋 Summary:');
    console.log('   - 1 admin user (username: admin, password: admin123)');
    console.log(`   - ${categories.length} categories`);
    console.log(`   - ${tags.length} tags`);
    console.log(`   - ${articles.length} articles`);
    console.log('   - 3 messages');

    await mongoose.disconnect();
    console.log('\n👋 Database connection closed.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error.message);
    process.exit(1);
  }
};

seedData();
