/**
 * Article Controller
 * 职责：HTTP 请求/响应处理，调用 articleService 完成业务操作
 */
const mongoose = require('mongoose');
const articleService = require('../services/articleService');
const { success, paginated, error } = require('../utils/response');

/**
 * 获取文章列表（前台）
 */
exports.getArticles = async (req, res, next) => {
  try {
    const { page, pageSize, keyword, category, tag, sort } = req.query;
    const { data, fromCache } = await articleService.getArticlesWithCache({
      page, pageSize, keyword, category, tag, sort,
    });
    if (fromCache) return res.json(data);
    return paginated(res, data.list, data.total, data.page, data.pageSize);
  } catch (err) {
    next(err);
  }
};

/**
 * 获取文章归档（按年份/月份分组）
 */
exports.getArchives = async (req, res, next) => {
  try {
    const { limit } = req.query;
    const data = await articleService.getArchives({ limit });
    return success(res, data);
  } catch (err) {
    next(err);
  }
};

/**
 * 获取文章详情（前台）
 */
exports.getArticle = async (req, res, next) => {
  try {
    const { id } = req.params;
    const githubUserId = req.githubUserId;

    const data = await articleService.getArticle(id, { githubUserId });
    if (!data) return error(res, 404, 'ARTICLE_NOT_FOUND', '文章不存在');

    // 阅读量防刷
    const ip = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    articleService.recordView(id, ip);

    return success(res, data);
  } catch (err) {
    next(err);
  }
};

/**
 * 增加文章阅读量
 */
exports.incArticleView = async (req, res, next) => {
  try {
    const { id } = req.params;
    const article = await articleService.getArticle(id);
    if (!article) return error(res, 404, 'ARTICLE_NOT_FOUND', '文章不存在');

    const ip = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    articleService.recordView(id, ip);
    return success(res);
  } catch (err) {
    next(err);
  }
};

/**
 * 文章点赞/取消点赞（需 GitHub 登录）
 */
exports.toggleArticleLike = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.githubUserId;
    const result = await articleService.toggleLike(id, userId);
    if (!result) return error(res, 404, 'ARTICLE_NOT_FOUND', '文章不存在');
    return success(res, result);
  } catch (err) {
    next(err);
  }
};

/**
 * 获取文章列表（后台）
 */
exports.getAdminArticles = async (req, res, next) => {
  try {
    const { page, pageSize, keyword, status, category, tags } = req.query;
    const { list, total, page: p, pageSize: ps } = await articleService.getAdminArticles({
      page, pageSize, keyword, status, category, tags,
    });
    return paginated(res, list, total, p, ps);
  } catch (err) {
    next(err);
  }
};

/**
 * 获取文章详情（后台）
 */
exports.getAdminArticle = async (req, res, next) => {
  try {
    const { id } = req.params;
    const article = await articleService.getAdminArticle(id);
    if (!article) return error(res, 404, 'ARTICLE_NOT_FOUND', '文章不存在');
    return success(res, article);
  } catch (err) {
    next(err);
  }
};

/**
 * 创建文章
 */
exports.createArticle = async (req, res, next) => {
  try {
    const { title, content, summary, cover, category, tags, status } = req.body;
    const article = await articleService.createArticle({
      title, content, summary, cover, category, tags, status, authorId: req.userId,
    });
    return success(res, article, '创建成功');
  } catch (err) {
    next(err);
  }
};

/**
 * 更新文章
 */
exports.updateArticle = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, content, summary, cover, category, tags, status } = req.body;
    const article = await articleService.updateArticle(id, { title, content, summary, cover, category, tags, status });
    if (!article) return error(res, 404, 'ARTICLE_NOT_FOUND', '文章不存在');
    return success(res, article, '更新成功');
  } catch (err) {
    next(err);
  }
};

/**
 * 删除文章
 */
exports.deleteArticle = async (req, res, next) => {
  try {
    const { id } = req.params;
    const article = await articleService.deleteArticle(id);
    if (!article) return error(res, 404, 'ARTICLE_NOT_FOUND', '文章不存在');
    return success(res, null, '删除成功');
  } catch (err) {
    next(err);
  }
};

/**
 * 获取上一篇和下一篇文章
 */
exports.getAdjacentArticles = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = await articleService.getAdjacentArticles(id);
    return success(res, data);
  } catch (err) {
    next(err);
  }
};
