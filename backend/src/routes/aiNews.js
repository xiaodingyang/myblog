/**
 * AI News Routes
 */
const express = require('express');
const router = express.Router();
const aiNewsController = require('../controllers/aiNewsController');

// SSE 推送接口（GET /api/ai-news/stream）
router.get('/stream', aiNewsController.streamNews);

// 获取最新新闻列表（GET /api/ai-news）
router.get('/', aiNewsController.getLatestNews);

// 手动刷新新闻（POST /api/ai-news/refresh）
router.post('/refresh', aiNewsController.refreshNews);

// 获取每日请求统计（GET /api/ai-news/stats）
router.get('/stats', aiNewsController.getDailyStats);

// 检查配置状态（GET /api/ai-news/config）
router.get('/config', aiNewsController.checkConfig);

module.exports = router;
