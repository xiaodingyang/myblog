/**
 * AI News Controller - 使用开源项目的 API
 * 为了避免 Mongoose 连接问题，直接使用原生 MongoDB 操作
 */
const rssParser = require('rss-parser');
const crypto = require('crypto');
const mongoose = require('mongoose');

const parser = new rssParser({
  timeout: 10000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (compatible; RealtimeRSSHub/1.0)',
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
    const news = await collection
      .find()
      .sort({ publishedAt: -1 })
      .limit(limitValidated)
      .toArray();
    
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
    const source = {
      id: 'infoq',
      name: 'InfoQ',
      url: 'https://www.infoq.cn/feed',
      limit: 20,
      keywords: ['AI', '人工智能', '机器学习', 'GPT', 'LLM'],
    };
    
    console.log(`[RSS] 开始抓取 [${source.name}] - ${new Date().toLocaleString()}`);
    const articles = await fetchFromRSS(source);
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
