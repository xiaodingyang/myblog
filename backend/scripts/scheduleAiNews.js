/**
 * AI News 定时任务脚本
 * 每 10 分钟从 InfoQ RSS 获取最新 AI 新闻
 */
require('dotenv').config();
const cron = require('node-cron');
const mongoose = require('mongoose');
const aiNewsService = require('../src/services/aiNewsService');

// 每 10 分钟执行一次: */10 * * * *
const CRON_SCHEDULE = '*/10 * * * *';

/**
 * 定时任务执行函数
 */
async function runTask() {
  try {
    console.log('[AiNews] ===== 定时任务开始 =====');
    console.log(`[AiNews] 当前时间: ${new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}`);

    // 检查 RSS 配置
    if (!aiNewsService.isConfigured()) {
      console.warn('[AiNews] RSS 未配置，跳过定时任务');
      return;
    }

    // 检查每日额度
    const stats = aiNewsService.getDailyStats();
    console.log(`[AiNews] 今日请求: ${stats.count}/${stats.limit}，剩余: ${stats.remaining}`);

    if (stats.remaining <= 0) {
      console.warn('[AiNews] 已达到每日请求额度限制，跳过本次任务');
      return;
    }

    // 获取并保存新闻
    const result = await aiNewsService.fetchAndSaveNews();
    console.log(`[AiNews] 定时任务完成: 新增 ${result.added} 条，重复 ${result.duplicates} 条`);

  } catch (error) {
    console.error('[AiNews] 定时任务执行失败:', error.message);
  } finally {
    console.log('[AiNews] ===== 定时任务结束 =====');
    console.log('');
  }
}

/**
 * 启动定时任务
 */
async function startScheduler() {
  console.log('[AiNews] 启动 AI 新闻定时任务...');
  
  // 连接数据库
  try {
    console.log('[AiNews] 连接数据库...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/blog');
    console.log('[AiNews] 数据库连接成功');
  } catch (error) {
    console.error('[AiNews] 数据库连接失败:', error.message);
    process.exit(1);
  }
  
  console.log(`[AiNews] 执行频率: 每 10 分钟 (${CRON_SCHEDULE})`);

  // 验证 cron 表达式
  if (!cron.validate(CRON_SCHEDULE)) {
    console.error('[AiNews] 无效的 cron 表达式:', CRON_SCHEDULE);
    process.exit(1);
  }

  // 立即执行一次
  runTask().catch(err => {
    console.error('[AiNews] 首次执行失败:', err);
  });

  // 启动定时任务
  const task = cron.schedule(CRON_SCHEDULE, runTask, {
    scheduled: true,
    timezone: 'Asia/Shanghai',
  });

  console.log('[AiNews] 定时任务已启动');

  // 优雅退出
  process.on('SIGTERM', () => {
    console.log('[AiNews] 收到 SIGTERM，停止定时任务...');
    task.stop();
    process.exit(0);
  });

  process.on('SIGINT', () => {
    console.log('[AiNews] 收到 SIGINT，停止定时任务...');
    task.stop();
    mongoose.connection.close();
    process.exit(0);
  });
}

// 如果直接运行此脚本，启动定时任务
if (require.main === module) {
  startScheduler();
}

module.exports = { runTask, startScheduler };
