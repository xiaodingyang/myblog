const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { cacheMiddleware } = require('../utils/cache');

// 获取分类列表（缓存 1 小时）
router.get('/', cacheMiddleware(3600), categoryController.getCategories);

// 获取分类详情
router.get('/:id', categoryController.getCategory);

module.exports = router;
