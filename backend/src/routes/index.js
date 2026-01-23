const express = require('express');
const router = express.Router();

const authRoutes = require('./auth');
const articleRoutes = require('./articles');
const categoryRoutes = require('./categories');
const tagRoutes = require('./tags');
const messageRoutes = require('./messages');
const uploadRoutes = require('./upload');
const adminRoutes = require('./admin');

// 公开路由
router.use('/auth', authRoutes);
router.use('/articles', articleRoutes);
router.use('/categories', categoryRoutes);
router.use('/tags', tagRoutes);
router.use('/messages', messageRoutes);
router.use('/upload', uploadRoutes);

// 后台管理路由
router.use('/admin', adminRoutes);

module.exports = router;
