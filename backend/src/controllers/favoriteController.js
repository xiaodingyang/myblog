const mongoose = require('mongoose');
const { Favorite, Article } = require('../models');

/**
 * 当前用户收藏列表
 */
exports.listFavorites = async (req, res, next) => {
  try {
    const userId = req.githubUserId;
    const { page = 1, pageSize = 20 } = req.query;
    const skip = (parseInt(page, 10) - 1) * parseInt(pageSize, 10);

    const [favorites, total] = await Promise.all([
      Favorite.find({ user: userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(pageSize, 10))
        .populate({
          path: 'article',
          match: { status: 'published' },
          select: '-content',
          populate: [
            { path: 'category', select: 'name' },
            { path: 'tags', select: 'name' },
            { path: 'author', select: 'username avatar' },
          ],
        })
        .lean(),
      Favorite.countDocuments({ user: userId }),
    ]);

    const list = favorites
      .filter((f) => f.article && f.article._id)
      .map((f) => f.article);

    res.json({
      code: 0,
      message: 'success',
      data: {
        list,
        total,
        page: parseInt(page, 10),
        pageSize: parseInt(pageSize, 10),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 添加收藏
 */
exports.addFavorite = async (req, res, next) => {
  try {
    const { articleId } = req.body;
    if (!articleId || !mongoose.Types.ObjectId.isValid(articleId)) {
      return res.status(400).json({ code: 400, message: '无效的文章 ID', data: null });
    }

    const article = await Article.findOne({ _id: articleId, status: 'published' });
    if (!article) {
      return res.status(404).json({ code: 404, message: '文章不存在', data: null });
    }

    try {
      await Favorite.create({ user: req.githubUserId, article: articleId });
    } catch (e) {
      if (e.code === 11000) {
        return res.json({ code: 0, message: '已收藏', data: { favorited: true } });
      }
      throw e;
    }

    res.status(201).json({
      code: 0,
      message: '收藏成功',
      data: { favorited: true },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 取消收藏
 */
exports.removeFavorite = async (req, res, next) => {
  try {
    const { articleId } = req.params;
    if (!articleId || !mongoose.Types.ObjectId.isValid(articleId)) {
      return res.status(400).json({ code: 400, message: '无效的文章 ID', data: null });
    }

    await Favorite.deleteOne({ user: req.githubUserId, article: articleId });

    res.json({
      code: 0,
      message: '已取消收藏',
      data: { favorited: false },
    });
  } catch (error) {
    next(error);
  }
};
