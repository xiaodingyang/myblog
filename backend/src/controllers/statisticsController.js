const { Article, Category, Tag, Message } = require('../models');

// 统计数据缓存（后台仪表盘不需要实时，缓存 2 分钟）
const statsCache = {
  data: null,
  expireAt: 0,
};
const STATS_CACHE_TTL = 2 * 60 * 1000; // 2分钟

/**
 * 获取统计数据
 */
exports.getStatistics = async (req, res, next) => {
  try {
    const now = Date.now();

    // 返回缓存
    if (statsCache.data && now < statsCache.expireAt) {
      return res.json({
        code: 0,
        message: 'success',
        data: statsCache.data,
        cached: true,
      });
    }

    const [
      articleCount,
      categoryCount,
      tagCount,
      messageCount,
      viewsResult,
    ] = await Promise.all([
      Article.countDocuments(),
      Category.countDocuments(),
      Tag.countDocuments(),
      Message.countDocuments(),
      Article.aggregate([
        { $group: { _id: null, totalViews: { $sum: '$views' } } },
      ]),
    ]);

    const totalViews = viewsResult[0]?.totalViews || 0;

    const data = {
      articleCount,
      categoryCount,
      tagCount,
      messageCount,
      totalViews,
    };

    // 更新缓存
    statsCache.data = data;
    statsCache.expireAt = now + STATS_CACHE_TTL;

    res.json({
      code: 0,
      message: 'success',
      data,
    });
  } catch (error) {
    next(error);
  }
};
