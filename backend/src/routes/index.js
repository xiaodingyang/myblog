const express = require('express');
const router = express.Router();

const authRoutes = require('./auth');
const articleRoutes = require('./articles');
const categoryRoutes = require('./categories');
const tagRoutes = require('./tags');
const messageRoutes = require('./messages');
const commentRoutes = require('./comments');
const uploadRoutes = require('./upload');
const rankingsRoutes = require('./rankings');
const favoritesRoutes = require('./favorites');
const adminRoutes = require('./admin');
const githubAuthRoutes = require('./githubAuth');
const followRoutes = require('./follow');
const notificationRoutes = require('./notifications');
const seriesRoutes = require('./series');

// 公开路由
router.use('/auth', authRoutes);
router.use('/articles', articleRoutes);
router.use('/categories', categoryRoutes);
router.use('/tags', tagRoutes);
router.use('/messages', messageRoutes);
router.use('/comments', commentRoutes);
router.use('/rankings', rankingsRoutes);
router.use('/favorites', favoritesRoutes);
router.use('/upload', uploadRoutes);
router.use('/github', githubAuthRoutes);

// 后台管理路由
router.use('/admin', adminRoutes);

// 关注功能
router.use('/follow', followRoutes);

// 通知
router.use('/notifications', notificationRoutes);

// 系列/专栏
router.use('/series', seriesRoutes);

module.exports = router;
