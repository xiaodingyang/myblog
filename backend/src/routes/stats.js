const express = require('express');
const router = express.Router();
const { auth, adminAuth } = require('../middlewares/auth');
const visitController = require('../controllers/visitController');

// 记录访问（无需登录，任何访客可触发）
router.post('/visit', visitController.recordVisit);

// 以下接口需要管理员登录
router.get('/overview', auth, adminAuth, visitController.getOverview);
router.get('/top-pages', auth, adminAuth, visitController.getTopPages);
router.get('/trend', auth, adminAuth, visitController.getTrend);
router.get('/referers', auth, adminAuth, visitController.getReferers);
router.get('/visits', auth, adminAuth, visitController.getVisits);

module.exports = router;
