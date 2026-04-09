/**
 * Favorite Controller
 */
const favoriteService = require('../services/favoriteService');
const { success, error, paginated } = require('../utils/response');

exports.listFavorites = async (req, res, next) => {
  try {
    const userId = req.githubUserId;
    const { page, pageSize } = req.query;
    const result = await favoriteService.listFavorites(userId, { page, pageSize });
    return res.json({ code: 0, message: 'success', data: result });
  } catch (err) {
    next(err);
  }
};

exports.addFavorite = async (req, res, next) => {
  try {
    const { articleId } = req.body;
    const userId = req.githubUserId;
    const result = await favoriteService.addFavorite(userId, articleId);
    if (result.alreadyExists) {
      return res.json({ code: 0, message: '已收藏', data: result });
    }
    return res.status(201).json({ code: 0, message: '收藏成功', data: result });
  } catch (err) {
    if (err.code === 400) return error(res, 400, 'PARAM_ERROR', err.message);
    if (err.code === 404) return error(res, 404, 'ARTICLE_NOT_FOUND', err.message);
    next(err);
  }
};

exports.removeFavorite = async (req, res, next) => {
  try {
    const { articleId } = req.params;
    const userId = req.githubUserId;
    await favoriteService.removeFavorite(userId, articleId);
    return res.json({ code: 0, message: '已取消收藏', data: { favorited: false } });
  } catch (err) {
    if (err.code === 400) return error(res, 400, 'PARAM_ERROR', err.message);
    next(err);
  }
};
