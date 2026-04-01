const express = require('express');
const router = express.Router();
const { Comment } = require('../models');

// 简单内存缓存
let cache = null;
let cacheTime = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5分钟

// GET /api/rankings/comments - 评论活跃榜
router.get('/comments', async (req, res, next) => {
  try {
    const { limit = 20 } = req.query;
    const now = Date.now();

    // 返回缓存
    if (cache && now - cacheTime < CACHE_TTL) {
      return res.json({
        code: 0,
        message: 'success',
        data: cache.slice(0, parseInt(limit)),
      });
    }

    const topUsers = await Comment.aggregate([
      { $match: { status: 'approved' } },
      {
        $group: {
          _id: '$user',
          commentCount: { $sum: 1 },
          latestCommentTime: { $max: '$createdAt' },
        },
      },
      { $sort: { commentCount: -1 } },
      { $limit: 100 },
      {
        $lookup: {
          from: 'githubusers',
          localField: '_id',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: '$user' },
      {
        $project: {
          _id: 0,
          userId: { $toString: '$user._id' },
          username: '$user.username',
          nickname: '$user.nickname',
          avatar: '$user.avatar',
          htmlUrl: '$user.htmlUrl',
          commentCount: 1,
          latestCommentTime: 1,
        },
      },
    ]);

    // 添加 rank 字段
    const ranked = topUsers.map((item, index) => ({
      rank: index + 1,
      ...item,
    }));

    // 更新缓存
    cache = ranked;
    cacheTime = now;

    res.json({
      code: 0,
      message: 'success',
      data: ranked.slice(0, parseInt(limit)),
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
