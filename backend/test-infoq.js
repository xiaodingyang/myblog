const mongoose = require('mongoose');
require('dotenv').config();

const aiNewsService = require('./src/services/aiNewsService');

async function test() {
  try {
    // 连接数据库
    console.log('连接数据库...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/blog');
    console.log('✓ 数据库连接成功\n');

    // 测试抓取
    console.log('开始抓取 InfoQ 新闻...');
    const result = await aiNewsService.fetchAndSaveNews();
    
    console.log('\n✓ 抓取完成！');
    console.log('结果:', JSON.stringify(result, null, 2));

    // 查询最新新闻
    console.log('\n查询最新新闻...');
    const news = await aiNewsService.getLatestNews(5);
    console.log(`共 ${news.length} 条新闻：`);
    news.forEach((item, index) => {
      console.log(`${index + 1}. ${item.title}`);
      console.log(`   来源: ${item.source.name} | 发布: ${item.publishedAt.toLocaleString()}`);
      console.log(`   标签: ${item.tags.join(', ')}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('测试失败:', error);
    process.exit(1);
  }
}

test();
