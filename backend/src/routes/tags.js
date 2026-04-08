const express = require('express');
const router = express.Router();
const tagController = require('../controllers/tagController');
const { cacheMiddleware } = require('../utils/cache');

// 获取标签列表（缓存 1 小时）
router.get('/', cacheMiddleware(3600), tagController.getTags);

// 获取标签详情
router.get('/:id', tagController.getTag);

module.exports = router;
