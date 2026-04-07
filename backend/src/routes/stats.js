const express = require('express');
const router = express.Router();
const visitController = require('../controllers/visitController');

// 总览统计
router.get('/overview', visitController.getOverview);

// 页面统计（热门页面排行）
router.get('/pages', visitController.getPageStats);

// 访问趋势（按日期聚合）
router.get('/trend', visitController.getTrend);

module.exports = router;
