/**
 * Statistics Service
 */
const { Article, Category, Tag, Message } = require('../models');

const statsCache = { data: null, expireAt: 0 };
const STATS_CACHE_TTL = 2 * 60 * 1000;

async function getStatistics() {
  const now = Date.now();
  if (statsCache.data && now < statsCache.expireAt) {
    return { ...statsCache.data, cached: true };
  }

  const [articleCount, categoryCount, tagCount, messageCount, viewsResult] = await Promise.all([
    Article.countDocuments(),
    Category.countDocuments(),
    Tag.countDocuments(),
    Message.countDocuments(),
    Article.aggregate([{ $group: { _id: null, totalViews: { $sum: '$views' } } }]),
  ]);

  const totalViews = viewsResult[0]?.totalViews || 0;
  const data = { articleCount, categoryCount, tagCount, messageCount, totalViews };

  statsCache.data = data;
  statsCache.expireAt = now + STATS_CACHE_TTL;

  return data;
}

module.exports = { getStatistics };
