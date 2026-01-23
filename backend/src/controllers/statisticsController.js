const { Article, Category, Tag, Message } = require('../models');

/**
 * 获取统计数据
 */
exports.getStatistics = async (req, res, next) => {
  try {
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

    res.json({
      code: 0,
      message: 'success',
      data: {
        articleCount,
        categoryCount,
        tagCount,
        messageCount,
        totalViews,
      },
    });
  } catch (error) {
    next(error);
  }
};
