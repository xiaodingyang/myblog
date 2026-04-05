const express = require('express');
const router = express.Router();
const { githubAuth } = require('../middlewares/auth');
const { Notification } = require('../models');

// GET / — 获取当前用户通知列表
router.get('/', githubAuth, async (req, res, next) => {
  try {
    const { page = 1, pageSize = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(pageSize);

    const [list, total] = await Promise.all([
      Notification.find({ toUser: req.githubUserId })
        .populate('fromUser', 'username nickname avatar')
        .populate('articleId', 'title')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(pageSize)),
      Notification.countDocuments({ toUser: req.githubUserId }),
    ]);

    res.json({
      code: 0,
      message: 'success',
      data: { list, total, page: parseInt(page), pageSize: parseInt(pageSize) },
    });
  } catch (error) {
    next(error);
  }
});

// GET /unread-count — 获取未读数
router.get('/unread-count', githubAuth, async (req, res, next) => {
  try {
    const count = await Notification.countDocuments({
      toUser: req.githubUserId,
      isRead: false,
    });
    res.json({ code: 0, data: { count } });
  } catch (error) {
    next(error);
  }
});

// PUT /read-all — 全部标记已读
router.put('/read-all', githubAuth, async (req, res, next) => {
  try {
    await Notification.updateMany(
      { toUser: req.githubUserId, isRead: false },
      { isRead: true },
    );
    res.json({ code: 0, message: '已全部标记为已读' });
  } catch (error) {
    next(error);
  }
});

// PUT /:id/read — 标记单条已读
router.put('/:id/read', githubAuth, async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, toUser: req.githubUserId },
      { isRead: true },
      { new: true },
    );
    if (!notification) {
      return res.status(404).json({ code: 404, message: '通知不存在' });
    }
    res.json({ code: 0, message: '已标记为已读', data: notification });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
