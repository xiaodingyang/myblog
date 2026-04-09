/**
 * Follow Service
 */
const { Follow, User } = require('../models');

async function followUser(followerId, userId) {
  if (!followerId) {
    const err = new Error('请先登录');
    err.code = 401;
    throw err;
  }
  if (followerId.toString() === userId) {
    const err = new Error('不能关注自己');
    err.code = 400;
    throw err;
  }
  const targetUser = await User.findById(userId);
  if (!targetUser) {
    const err = new Error('用户不存在');
    err.code = 404;
    throw err;
  }
  const existing = await Follow.findOne({ followerId, followingId: userId });
  if (existing) {
    const err = new Error('已经关注过该用户');
    err.code = 400;
    err.alreadyExists = true;
    throw err;
  }
  await Follow.create({ followerId, followingId: userId });
  return { following: true };
}

async function unfollowUser(followerId, userId) {
  if (!followerId) {
    const err = new Error('请先登录');
    err.code = 401;
    throw err;
  }
  const result = await Follow.deleteOne({ followerId, followingId: userId });
  if (result.deletedCount === 0) {
    const err = new Error('未关注该用户');
    err.code = 400;
    throw err;
  }
  return { following: false };
}

async function getFollowStatus(followerId, userId) {
  if (!followerId) return { following: false };
  const existing = await Follow.findOne({ followerId, followingId: userId });
  return { following: !!existing };
}

async function getFollowers(userId, { page = 1, pageSize = 20 } = {}) {
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
  const list = follows.map(f => ({ user: f.followerId, createdAt: f.createdAt }));
  return { list, total, page: parseInt(page), pageSize: parseInt(pageSize) };
}

async function getFollowing(userId, { page = 1, pageSize = 20 } = {}) {
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
  const list = follows.map(f => ({ user: f.followingId, createdAt: f.createdAt }));
  return { list, total, page: parseInt(page), pageSize: parseInt(pageSize) };
}

module.exports = { followUser, unfollowUser, getFollowStatus, getFollowers, getFollowing };
