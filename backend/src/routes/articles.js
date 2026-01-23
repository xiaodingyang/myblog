const express = require('express');
const router = express.Router();
const articleController = require('../controllers/articleController');

// 获取文章列表（前台）
router.get('/', articleController.getArticles);

// 获取文章详情（前台）
router.get('/:id', articleController.getArticle);

module.exports = router;
