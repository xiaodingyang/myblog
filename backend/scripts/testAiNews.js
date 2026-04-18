/**
 * AI News 功能测试脚本
 * 验证核心功能是否正常
 */
require('dotenv').config();
const mongoose = require('mongoose');
const { AiNews } = require('../src/models');
const aiNewsService = require('../src/services/aiNewsService');

async function runTests() {
  console.log('===== AI News 功能测试 =====\n');

  try {
    // 1. 连接数据库
    console.log('1. 连接数据库...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/blog', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('   ✓ 数据库连接成功\n');

    // 2. 检查配置
    console.log('2. 检查 NewsAPI 配置...');
    const configured = aiNewsService.isConfigured();
    console.log(`   ${configured ? '✓' : '✗'} NewsAPI ${configured ? '已配置' : '未配置'}`);
    if (!configured) {
      console.log('   提示: 请在 .env 中设置 NEWSAPI_KEY\n');
    }
    console.log();

    // 3. 检查每日统计
    console.log('3. 获取每日请求统计...');
    const stats = aiNewsService.getDailyStats();
    console.log(`   今日请求: ${stats.count}/${stats.limit}, 剩余: ${stats.remaining}\n`);

    // 4. 测试数据库查询
    console.log('4. 查询现有新闻数量...');
    const count = await AiNews.countDocuments();
    console.log(`   数据库中已有 ${count} 条新闻\n`);

    // 5. 如果已配置，尝试获取最新新闻
    if (configured) {
      console.log('5. 获取最新新闻列表...');
      const news = await aiNewsService.getLatestNews(5);
      console.log(`   成功获取 ${news.length} 条新闻`);
      if (news.length > 0) {
        console.log('   最新一条:', {
          title: news[0].title,
          source: news[0].source?.name,
          publishedAt: news[0].publishedAt,
        });
      }
      console.log();

      // 如果剩余额度充足，尝试刷新一次（需要用户确认）
      if (stats.remaining > 0 && process.env.TEST_REFRESH === 'true') {
        console.log('6. 手动刷新新闻...');
        console.log(`   剩余额度: ${stats.remaining}，准备请求 NewsAPI...`);
        try {
          const result = await aiNewsService.fetchAndSaveNews();
          console.log(`   ✓ 刷新完成: 新增 ${result.added} 条，重复 ${result.duplicates} 条`);
        } catch (error) {
          console.log(`   ✗ 刷新失败: ${error.message}`);
        }
      } else if (stats.remaining > 0) {
        console.log('6. 跳过刷新测试（设置 TEST_REFRESH=true 可测试刷新功能）\n');
      } else {
        console.log('6. 跳过刷新测试（今日额度已用尽）\n');
      }
    } else {
      console.log('5. 跳过 NewsAPI 测试（未配置 API Key）\n');
    }

    console.log('===== 测试完成 =====');
    console.log('\n提示:');
    console.log('- 运行定时任务: pnpm ai-news:schedule');
    console.log('- 手动刷新一次: pnpm ai-news:refresh');
    console.log('- 查看配置: curl http://localhost:8081/api/ai-news/config');
    console.log('- 获取新闻: curl http://localhost:8081/api/ai-news');

  } catch (error) {
    console.error('✗ 测试失败:', error.message);
    console.error('\n错误详情:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n数据库连接已关闭');
    process.exit(0);
  }
}

// 运行测试
runTests();
