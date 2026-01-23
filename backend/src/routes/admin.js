const express = require('express');
const router = express.Router();

const { auth, adminAuth } = require('../middlewares/auth');
const { validate, schemas } = require('../middlewares/validate');

const articleController = require('../controllers/articleController');
const categoryController = require('../controllers/categoryController');
const tagController = require('../controllers/tagController');
const messageController = require('../controllers/messageController');
const statisticsController = require('../controllers/statisticsController');

// 所有后台路由都需要认证和管理员权限
router.use(auth);
router.use(adminAuth);

// 统计数据
router.get('/statistics', statisticsController.getStatistics);

// 文章管理
router.get('/articles', articleController.getAdminArticles);
router.get('/articles/:id', articleController.getAdminArticle);
router.post('/articles', validate(schemas.article), articleController.createArticle);
router.put('/articles/:id', validate(schemas.article), articleController.updateArticle);
router.delete('/articles/:id', articleController.deleteArticle);

// 分类管理
router.post('/categories', validate(schemas.category), categoryController.createCategory);
router.put('/categories/:id', validate(schemas.category), categoryController.updateCategory);
router.delete('/categories/:id', categoryController.deleteCategory);

// 标签管理
router.post('/tags', validate(schemas.tag), tagController.createTag);
router.put('/tags/:id', validate(schemas.tag), tagController.updateTag);
router.delete('/tags/:id', tagController.deleteTag);

// 留言管理
router.get('/messages', messageController.getAdminMessages);
router.put('/messages/:id/review', validate(schemas.reviewMessage), messageController.reviewMessage);
router.delete('/messages/:id', messageController.deleteMessage);

module.exports = router;
