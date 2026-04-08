const express = require('express');
const router = express.Router();

const { auth, adminAuth } = require('../middlewares/auth');
const { validate, schemas } = require('../middlewares/validate');
const { clearCache } = require('../utils/cache');

const articleController = require('../controllers/articleController');
const categoryController = require('../controllers/categoryController');
const tagController = require('../controllers/tagController');
const messageController = require('../controllers/messageController');
const commentController = require('../controllers/commentController');
const githubUserController = require('../controllers/githubUserController');
const statisticsController = require('../controllers/statisticsController');

// 所有后台路由都需要认证和管理员权限
router.use(auth);
router.use(adminAuth);

// 统计数据
router.get('/statistics', statisticsController.getStatistics);

// 文章管理 — 写操作成功后清除文章列表和归档缓存
const invalidateArticles = (req, res, next) => {
  res.on('finish', () => { if (res.statusCode < 300) clearCache('/articles'); });
  next();
};
const invalidateCategories = (req, res, next) => {
  res.on('finish', () => { if (res.statusCode < 300) clearCache('/categories'); });
  next();
};
const invalidateTags = (req, res, next) => {
  res.on('finish', () => { if (res.statusCode < 300) clearCache('/tags'); });
  next();
};

router.get('/articles', articleController.getAdminArticles);
router.get('/articles/:id', articleController.getAdminArticle);
router.post('/articles', invalidateArticles, validate(schemas.article), articleController.createArticle);
router.put('/articles/:id', invalidateArticles, validate(schemas.article), articleController.updateArticle);
router.delete('/articles/:id', invalidateArticles, articleController.deleteArticle);

// 分类管理
router.post('/categories', invalidateCategories, validate(schemas.category), categoryController.createCategory);
router.put('/categories/:id', invalidateCategories, validate(schemas.category), categoryController.updateCategory);
router.delete('/categories/:id', invalidateCategories, categoryController.deleteCategory);

// 标签管理
router.post('/tags', invalidateTags, validate(schemas.tag), tagController.createTag);
router.put('/tags/:id', invalidateTags, validate(schemas.tag), tagController.updateTag);
router.delete('/tags/:id', invalidateTags, tagController.deleteTag);

// 留言管理
router.get('/messages', messageController.getAdminMessages);
router.put('/messages/:id/review', validate(schemas.reviewMessage), messageController.reviewMessage);
router.delete('/messages/:id', messageController.deleteMessage);

// 评论管理
router.get('/comments', commentController.getAdminComments);
router.put('/comments/:id/review', validate(schemas.reviewMessage), commentController.reviewComment);
router.delete('/comments/:id', commentController.deleteComment);

// GitHub 用户管理
router.get('/users', githubUserController.getUsers);
router.put('/users/:id/status', githubUserController.updateUserStatus);
router.delete('/users/:id', githubUserController.deleteUser);

module.exports = router;
