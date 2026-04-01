const mongoose = require('mongoose');
const connectDB = require('../config/database');
const { Article, Comment, GithubUser } = require('../models');

async function createTestComments() {
  await connectDB();
  
  console.log('🔍 查找现有文章...');
  const articles = await Article.find().limit(3);
  if (articles.length === 0) {
    console.log('❌ 没有找到文章，请先确保有文章数据');
    process.exit(1);
  }
  console.log(`✅ 找到 ${articles.length} 篇文章`);

  console.log('🔍 查找或创建测试用户...');
  let users = await GithubUser.find().limit(3);
  
  if (users.length < 2) {
    // 创建测试用户 (githubId 是 Number 类型)
    const testUsers = [
      { githubId: 999001, username: 'TestUser1', nickname: '测试用户1', avatar: 'https://avatars.githubusercontent.com/u/1?v=4', htmlUrl: 'https://github.com/testuser1' },
      { githubId: 999002, username: 'TestUser2', nickname: '测试用户2', avatar: 'https://avatars.githubusercontent.com/u/2?v=4', htmlUrl: 'https://github.com/testuser2' },
      { githubId: 999003, username: 'TestUser3', nickname: '测试用户3', avatar: 'https://avatars.githubusercontent.com/u/3?v=4', htmlUrl: 'https://github.com/testuser3' },
    ];
    users = await GithubUser.insertMany(testUsers);
    console.log(`✅ 创建了 ${users.length} 个测试用户`);
  } else {
    console.log(`✅ 找到 ${users.length} 个已有用户`);
  }

  console.log('🗑️ 清理旧测试评论...');
  await Comment.deleteMany({ content: { $regex: /^测试评论|^这是测试/ } });

  console.log('📝 创建测试评论...');
  const testComments = [];
  
  // 为每篇文章创建评论
  for (const article of articles) {
    // 每篇文章2-3条评论
    const numComments = 2 + Math.floor(Math.random() * 2);
    for (let i = 0; i < numComments; i++) {
      const user = users[i % users.length];
      const comment = {
        articleId: article._id,
        user: user._id,
        content: `测试评论 ${i + 1}：这篇文章写得真好！作者加油 💪`,
        status: 'approved',
        likes: [],
        likeCount: 0
      };
      
      // 随机给一些评论添加点赞
      const numLikes = Math.floor(Math.random() * users.length);
      for (let j = 0; j < numLikes; j++) {
        if (!comment.likes.includes(users[j]._id)) {
          comment.likes.push(users[j]._id);
        }
      }
      comment.likeCount = comment.likes.length;
      
      testComments.push(comment);
    }
  }

  const created = await Comment.insertMany(testComments);
  console.log(`✅ 成功创建 ${created.length} 条测试评论`);

  // 显示结果
  console.log('\n📊 测试数据统计：');
  const stats = await Comment.aggregate([
    { $match: { status: 'approved' } },
    { $group: { _id: null, total: { $sum: 1 }, totalLikes: { $sum: '$likeCount' } } }
  ]);
  if (stats.length > 0) {
    console.log(`   总评论数: ${stats[0].total}`);
    console.log(`   总点赞数: ${stats[0].totalLikes}`);
  }

  console.log('\n📋 各文章评论数：');
  const byArticle = await Comment.aggregate([
    { $match: { status: 'approved' } },
    { $group: { _id: '$articleId', count: { $sum: 1 } } },
    { $lookup: { from: 'articles', localField: '_id', foreignField: '_id', as: 'article' } },
    { $unwind: '$article' },
    { $project: { title: '$article.title', count: 1 } }
  ]);
  byArticle.forEach(a => console.log(`   - ${a.title}: ${a.count} 条评论`));

  console.log('\n✅ 测试数据创建完成！');
  process.exit(0);
}

createTestComments().catch(err => {
  console.error('❌ 错误:', err);
  process.exit(1);
});
