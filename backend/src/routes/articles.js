const express = require('express');
const router = express.Router();
const articleController = require('../controllers/articleController');
const { optionalAuth, githubAuth } = require('../middlewares/auth');

// 获取文章列表（前台）
router.get('/', articleController.getArticles);

// 获取文章归档
router.get('/archives', articleController.getArchives);

// 文章点赞（需登录，须放在 /:id 之前避免误匹配时可区分的路径）
router.post('/:id/like', githubAuth, articleController.toggleArticleLike);

// 获取文章详情（前台）
router.get('/:id', optionalAuth, articleController.getArticle);

module.exports = router;
