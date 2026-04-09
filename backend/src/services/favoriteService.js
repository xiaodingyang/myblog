/**
 * Favorite Service
 */
const mongoose = require('mongoose');
const { Favorite, Article } = require('../models');

async function listFavorites(userId, { page = 1, pageSize = 20 } = {}) {
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
    .filter(f => f.article && f.article._id)
    .map(f => f.article);

  return { list, total, page: parseInt(page, 10), pageSize: parseInt(pageSize, 10) };
}

async function addFavorite(userId, articleId) {
  if (!articleId || !mongoose.Types.ObjectId.isValid(articleId)) {
    const err = new Error('无效的文章 ID');
    err.code = 400;
    throw err;
  }

  const article = await Article.findOne({ _id: articleId, status: 'published' });
  if (!article) {
    const err = new Error('文章不存在');
    err.code = 404;
    throw err;
  }

  try {
    await Favorite.create({ user: userId, article: articleId });
  } catch (e) {
    if (e.code === 11000) {
      return { favorited: true, alreadyExists: true };
    }
    throw e;
  }
  return { favorited: true };
}

async function removeFavorite(userId, articleId) {
  if (!articleId || !mongoose.Types.ObjectId.isValid(articleId)) {
    const err = new Error('无效的文章 ID');
    err.code = 400;
    throw err;
  }
  await Favorite.deleteOne({ user: userId, article: articleId });
  return { favorited: false };
}

module.exports = { listFavorites, addFavorite, removeFavorite };
