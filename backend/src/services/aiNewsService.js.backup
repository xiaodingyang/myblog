/**
 * AI News Service
 * 从 InfoQ RSS 获取 AI 相关新闻，支持 SSE 推送和定时刷新
 */
const { AiNews } = require('../models');
const Parser = require('rss-parser');
const crypto = require('crypto');

const parser = new Parser({
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'application/rss+xml, application/xml, text/xml, */*'
  },
  timeout: 10000
});
const RSS_URL = 'https://www.infoq.cn/feed';

// 内存限流计数器（每天重置）
let dailyRequestCount = 0;
let lastResetDate = new Date().toDateString();

/**
 * 重置每日请求计数
 */
function resetDailyCount() {
  const today = new Date().toDateString();
  if (lastResetDate !== today) {
    dailyRequestCount = 0;
    lastResetDate = today;
    console.log('[AiNews] 每日请求计数已重置');
  }
}

/**
 * 检查配置（RSS 不需要 API Key）
 * @returns {boolean}
 */
function isConfigured() {
  return true; // RSS 始终可用
}

/**
 * 从标题提取关键词作为标签
 * @param {string} title 
 * @returns {Array<string>}
 */
function extractTags(title) {
  const keywords = [
    'AI', '人工智能', '机器学习', '深度学习', '神经网络',
    'GPT', 'ChatGPT', 'LLM', '大模型', 'Transformer',
    '计算机视觉', 'NLP', '自然语言处理', '强化学习',
    '生成式AI', 'AIGC', '多模态', '预训练',
    'OpenAI', 'Google', 'Meta', 'DeepMind', '百度', '阿里', '腾讯'
  ];
  
  const tags = [];
  const lowerTitle = title.toLowerCase();
  
  for (const keyword of keywords) {
    if (lowerTitle.includes(keyword.toLowerCase())) {
      tags.push(keyword);
    }
  }
  
  return tags.slice(0, 5); // 最多 5 个标签
}

/**
 * 从机器之心 RSS 获取新闻
 * @returns {Promise<Array>}
 */
async function fetchNewsFromRSS() {
  resetDailyCount();

  try {
    console.log('[AiNews] 开始抓取 InfoQ RSS...');
    const feed = await parser.parseURL(RSS_URL);
    
    dailyRequestCount++;
    console.log(`[AiNews] RSS 抓取成功，获取 ${feed.items.length} 条新闻`);

    return feed.items.map(item => ({
      title: item.title || '',
      source: { id: 'infoq', name: 'InfoQ' },
      publishedAt: item.pubDate ? new Date(item.pubDate) : new Date(),
      summary: item.contentSnippet || item.content || '',
      tags: extractTags(item.title || ''),
      url: item.link || '',
      imageUrl: item.enclosure?.url || '',
      articleId: crypto.createHash('md5').update(item.link || '').digest('hex'),
    }));
  } catch (error) {
    console.error('[AiNews] RSS 抓取失败:', error);
    throw error;
  }
}

/**
 * 保存新闻到数据库（自动去重）
 * @param {Array} articles 新闻数组
 * @returns {Promise<{added: number, duplicates: number}>}
 */
async function saveNewsWithDeduplication(articles) {
  let added = 0;
  let duplicates = 0;
  const errors = [];

  for (const article of articles) {
    if (!article.url || !article.title) {
      console.warn('[AiNews] 跳过无效文章（缺少 url 或 title）');
      continue;
    }

    try {
      const existing = await AiNews.findOne({ articleId: article.articleId });
      if (existing) {
        duplicates++;
      } else {
        await AiNews.create(article);
        added++;
      }
    } catch (error) {
      if (error.code === 11000) {
        duplicates++;
      } else {
        console.error('[AiNews] 保存新闻失败:', error.message);
        errors.push(error.message);
      }
    }
  }

  console.log(`[AiNews] 保存完成: 新增 ${added} 条，重复 ${duplicates} 条${errors.length > 0 ? `，错误 ${errors.length} 条` : ''}`);
  return { added, duplicates, errors };
}

/**
 * 获取最新新闻列表
 * @param {number} limit 限制数量
 * @returns {Promise<Array>}
 */
async function getLatestNews(limit = 20) {
  return AiNews.find()
    .sort({ publishedAt: -1 })
    .limit(limit)
    .lean();
}

/**
 * 从 RSS 获取并保存最新新闻（定时任务使用）
 * @returns {Promise<{added: number, duplicates: number}>}
 */
async function fetchAndSaveNews() {
  try {
    console.log('[AiNews] 开始获取新闻...');
    const articles = await fetchNewsFromRSS();

    if (!articles || articles.length === 0) {
      console.log('[AiNews] 未获取到新新闻');
      return { added: 0, duplicates: 0 };
    }

    const result = await saveNewsWithDeduplication(articles);
    return result;
  } catch (error) {
    console.error('[AiNews] fetchAndSaveNews 失败:', error);
    throw error;
  }
}

/**
 * 获取每日请求统计
 * @returns {{count: number, limit: number}}
 */
function getDailyStats() {
  resetDailyCount();
  return {
    count: dailyRequestCount,
    limit: 999, // RSS 无限制
    remaining: 999,
  };
}

module.exports = {
  isConfigured,
  fetchNewsFromRSS,
  saveNewsWithDeduplication,
  getLatestNews,
  fetchAndSaveNews,
  getDailyStats,
};
