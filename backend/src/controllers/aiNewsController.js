/**
 * AI News Controller - 使用开源项目的 API
 * 为了避免 Mongoose 连接问题，直接使用原生 MongoDB 操作
 */
const rssParser = require('rss-parser');
const crypto = require('crypto');
const mongoose = require('mongoose');

const parser = new rssParser({
  timeout: 20000,
  headers: {
    // InfoQ 等对「爬虫式 UA」常返回 404/451 或非 RSS；需接近浏览器
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    Accept: 'application/rss+xml, application/atom+xml, application/xml, text/xml;q=0.9, */*;q=0.8',
  },
});

// 数据库集合（使用原生 MongoDB 驱动）
let newsCollection = null;

/**
 * 获取新闻集合
 */
function getNewsCollection() {
  if (!newsCollection) {
    newsCollection = mongoose.connection.collection('news');
  }
  return newsCollection;
}

/**
 * 生成文章唯一 ID（URL MD5）
 */
function generateArticleId(url) {
  return crypto.createHash('md5').update(url).digest('hex');
}

/**
 * 从 RSS Feed 抓取新闻
 */
async function fetchFromRSS(source) {
  try {
    const feed = await parser.parseURL(source.url);
    
    const articles = feed.items
      .slice(0, source.limit || 20)
      .map(item => transformRSSItem(item, source))
      .filter(article => matchKeywords(article, source.keywords));
    
    return articles;
  } catch (err) {
    console.error(`[RSS] 抓取失败 [${source.name}]:`, err.message);
    return [];
  }
}

/**
 * 转换 RSS 条目为标准格式
 */
function transformRSSItem(item, source) {
  return {
    title: item.title || '',
    url: item.link || '',
    publishedAt: new Date(item.pubDate || item.isoDate || Date.now()),
    summary: item.contentSnippet || item.content?.substring(0, 200) || '',
    content: item.content || '',
    source: {
      id: source.id,
      name: source.name,
    },
    tags: extractTags(item, source.keywords),
    imageUrl: item.enclosure?.url || item['media:thumbnail']?.$?.url || '',
    author: item.creator || item.author || '',
    articleId: generateArticleId(item.link),
  };
}

/**
 * 提取标签
 */
function extractTags(item, keywords = []) {
  const text = `${item.title} ${item.contentSnippet || ''}`.toLowerCase();
  return keywords.filter(keyword => text.includes(keyword.toLowerCase()));
}

/**
 * 关键词匹配过滤
 */
function matchKeywords(article, keywords) {
  if (!keywords || keywords.length === 0) return true;
  
  const text = `${article.title} ${article.summary}`.toLowerCase();
  return keywords.some(keyword => text.includes(keyword.toLowerCase()));
}

/**
 * 保存新闻（带去重）
 */
async function saveNews(articles) {
  const result = { added: 0, duplicates: 0, errors: 0 };
  const collection = getNewsCollection();
  
  for (const article of articles) {
    try {
      const exists = await collection.findOne({ articleId: article.articleId });
      
      if (!exists) {
        await collection.insertOne({
          ...article,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        result.added++;
      } else {
        result.duplicates++;
      }
    } catch (err) {
      console.error('[RSS] 保存失败:', article.title, err.message);
      result.errors++;
    }
  }
  
  return result;
}

/** InfoQ 主站 RSS（官方 feed；需配合浏览器 UA 才能稳定解析） */
const INFOQ_FEED_URL = 'https://www.infoq.cn/feed';

/** 备用：奇客资讯（国内可解析性较好，minifeed 存在非法 XML 实体导致 rss-parser 报错故不用） */
const SOLIDOT_FEED_URL = 'https://www.solidot.org/index.rss';

/**
 * 稍宽的关键词：仅拉丁词时中文标题容易全被过滤，导致「有 RSS 但 0 条入库」
 */
const INFOQ_KEYWORDS_WIDE = [
  'ai', 'gpt', 'llm', 'chatgpt', 'openai', 'agent', 'rag', 'embedding',
  '模型', '智能', '学习', '深度', '算法', '推理', '训练', '数据',
  '机器学习', '人工智能', '神经网络', '大模型', '多模态', '云原生',
];

/**
 * 抓取 AI/技术资讯：InfoQ 优先；解析或过滤为空时用 Solidot 兜底，避免首页一直空
 */
async function fetchInfoqArticlesForIngest() {
  const infoqBase = { id: 'infoq', name: 'InfoQ', url: INFOQ_FEED_URL };
  let articles = await fetchFromRSS({ ...infoqBase, limit: 40, keywords: INFOQ_KEYWORDS_WIDE });
  if (articles.length === 0) {
    console.warn('[AiNews] InfoQ 关键词过滤后无条目，改为无关键词取 RSS 前 30 条');
    articles = await fetchFromRSS({ ...infoqBase, limit: 30, keywords: [] });
  }
  if (articles.length > 0) {
    return articles;
  }

  const solidot = { id: 'solidot', name: 'Solidot', url: SOLIDOT_FEED_URL };
  articles = await fetchFromRSS({ ...solidot, limit: 25, keywords: INFOQ_KEYWORDS_WIDE });
  if (articles.length === 0) {
    console.warn('[AiNews] Solidot 关键词过滤后无条目，改为无关键词取前 20 条');
    articles = await fetchFromRSS({ ...solidot, limit: 20, keywords: [] });
  }
  if (articles.length > 0) {
    console.log(`[AiNews] InfoQ 无可用条目，已使用 Solidot 备用源: ${articles.length} 条`);
  }
  return articles;
}

/** 列表为空时自动拉 RSS 入库（线上常未单独跑 scheduleAiNews.js） */
let lastAutoSyncWhenEmptyAt = 0;
const AUTO_SYNC_WHEN_EMPTY_COOLDOWN_MS = 2 * 60 * 1000;

/**
 * SSE 推送最新新闻
 */
const streamNews = async (req, res, next) => {
  try {
    // 设置 SSE 响应头
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');

    // 发送初始连接消息
    res.write(`: connected\n\n`);

    try {
      // 获取最新 20 条新闻
      const collection = getNewsCollection();
      const news = await collection
        .find()
        .sort({ publishedAt: -1 })
        .limit(20)
        .toArray();

      if (news.length === 0) {
        res.write(`: no news available\n\n`);
        res.write('event: done\ndata: {"status":"no_news"}\n\n');
        res.end();
        return;
      }

      // 一次性发送所有新闻（前端期望的格式）
      const payload = JSON.stringify({ type: 'news', data: news });
      res.write(`data: ${payload}\n\n`);

      // 发送结束消息
      res.write('event: done\ndata: {"status":"completed","count":' + news.length + '}\n\n');
      res.end();

      console.log(`[AiNews] SSE 推送完成: ${news.length} 条新闻`);
    } catch (err) {
      res.write(`event: error\ndata: ${JSON.stringify({ error: err.message })}\n\n`);
      res.end();
      console.error('[AiNews] SSE 推送错误:', err);
    }

    req.on('close', () => {
      console.log('[AiNews] SSE 客户端断开连接');
    });
  } catch (err) {
    next(err);
  }
};

/**
 * 获取最新新闻列表（普通 GET 请求）
 */
const getLatestNews = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const limitValidated = Math.min(limit, 100);

    const collection = getNewsCollection();
    const querySorted = () =>
      collection
        .find()
        .sort({ publishedAt: -1 })
        .limit(limitValidated)
        .toArray();

    let news = await querySorted();

    if (
      news.length === 0 &&
      mongoose.connection.readyState === 1 &&
      Date.now() - lastAutoSyncWhenEmptyAt >= AUTO_SYNC_WHEN_EMPTY_COOLDOWN_MS
    ) {
      lastAutoSyncWhenEmptyAt = Date.now();
      try {
        const articles = await fetchInfoqArticlesForIngest();
        const result = await saveNews(articles);
        console.log(
          `[AiNews] 列表为空已自动同步: RSS 解析 ${articles.length} 条, 新增 ${result.added}, 重复 ${result.duplicates}, 错误 ${result.errors}`,
        );
        news = await querySorted();
      } catch (syncErr) {
        console.error('[AiNews] 空库自动同步失败:', syncErr.message);
      }
    }

    return res.json({
      success: true,
      data: news,
      count: news.length,
    });
  } catch (err) {
    console.error('[AiNews] 获取新闻失败:', err);
    next(err);
  }
};

/**
 * 手动刷新新闻（触发定时任务）
 */
const refreshNews = async (req, res, next) => {
  try {
    console.log(`[RSS] 开始抓取 [InfoQ] - ${new Date().toLocaleString()}`);
    const articles = await fetchInfoqArticlesForIngest();
    console.log(`[RSS] 抓取完成: ${articles.length} 条新闻`);
    
    const result = await saveNews(articles);
    
    return res.json({
      success: true,
      data: result,
      message: `刷新完成: 新增 ${result.added} 条，重复 ${result.duplicates} 条`,
    });
  } catch (err) {
    console.error('[AiNews] refreshNews 失败:', err);
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

/**
 * 获取每日请求统计
 */
const getDailyStats = async (req, res, next) => {
  try {
    return res.json({
      success: true,
      data: {
        totalRequests: 0,
        successfulFetches: 0,
        failedFetches: 0,
        lastFetch: null,
      },
    });
  } catch (err) {
    console.error('[AiNews] 获取统计失败:', err);
    next(err);
  }
};

/**
 * 检查 NewsAPI 配置状态
 */
const checkConfig = async (req, res, next) => {
  try {
    return res.json({
      success: true,
      data: {
        configured: true,
        message: 'RSS 源已配置',
      },
    });
  } catch (err) {
    console.error('[AiNews] 检查配置失败:', err);
    next(err);
  }
};

/**
 * 停止定时任务（优雅关闭）
 */
const stopScheduler = async () => {
  console.log('[AiNews] 停止定时任务（博客模式）');
};

module.exports = {
  streamNews,
  getLatestNews,
  refreshNews,
  getDailyStats,
  checkConfig,
  stopScheduler,
};
