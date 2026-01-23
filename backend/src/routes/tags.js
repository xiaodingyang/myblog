const express = require('express');
const router = express.Router();
const tagController = require('../controllers/tagController');

// 获取标签列表
router.get('/', tagController.getTags);

// 获取标签详情
router.get('/:id', tagController.getTag);

module.exports = router;
