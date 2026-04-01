const { Follow, User } = require('../models');

/**
 * 关注用户
 */
exports.followUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const followerId = req.userId;

    if (!followerId) {
      return res.status(401).json({
        code: 401,
        message: '请先登录',
        data: null,
      });
    }

    if (followerId.toString() === userId) {
      return res.status(400).json({
        code: 400,
        message: '不能关注自己',
        data: null,
      });
    }

    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return res.status(404).json({
        code: 404,
        message: '用户不存在',
        data: null,
      });
    }

    const existing = await Follow.findOne({ followerId, followingId: userId });
    if (existing) {
      return res.status(400).json({
        code: 400,
        message: '已经关注过该用户',
        data: null,
      });
    }

    await Follow.create({ followerId, followingId: userId });

    res.json({
      code: 0,
      message: '关注成功',
      data: { following: true },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 取消关注
 */
exports.unfollowUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const followerId = req.userId;

    if (!followerId) {
      return res.status(401).json({
        code: 401,
        message: '请先登录',
        data: null,
      });
    }

    const result = await Follow.deleteOne({ followerId, followingId: userId });

    if (result.deletedCount === 0) {
      return res.status(400).json({
        code: 400,
        message: '未关注该用户',
        data: null,
      });
    }

    res.json({
      code: 0,
      message: '取消关注成功',
      data: { following: false },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 查询关注状态
 */
exports.getFollowStatus = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const followerId = req.userId;

    if (!followerId) {
      return res.json({
        code: 0,
        message: 'success',
        data: { following: false },
      });
    }

    const existing = await Follow.findOne({ followerId, followingId: userId });

    res.json({
      code: 0,
      message: 'success',
      data: { following: !!existing },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 获取粉丝列表
 */
exports.getFollowers = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { page = 1, pageSize = 20 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(pageSize);

    const [follows, total] = await Promise.all([
      Follow.find({ followingId: userId })
        .populate('followerId', 'username avatar bio')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(pageSize))
        .lean(),
      Follow.countDocuments({ followingId: userId }),
    ]);

    const list = follows.map((f) => ({
      user: f.followerId,
      createdAt: f.createdAt,
    }));

    res.json({
      code: 0,
      message: 'success',
      data: {
        list,
        total,
        page: parseInt(page),
        pageSize: parseInt(pageSize),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 获取关注列表
 */
exports.getFollowing = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { page = 1, pageSize = 20 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(pageSize);

    const [follows, total] = await Promise.all([
      Follow.find({ followerId: userId })
        .populate('followingId', 'username avatar bio')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(pageSize))
        .lean(),
      Follow.countDocuments({ followerId: userId }),
    ]);

    const list = follows.map((f) => ({
      user: f.followingId,
      createdAt: f.createdAt,
    }));

    res.json({
      code: 0,
      message: 'success',
      data: {
        list,
        total,
        page: parseInt(page),
        pageSize: parseInt(pageSize),
      },
    });
  } catch (error) {
    next(error);
  }
};
