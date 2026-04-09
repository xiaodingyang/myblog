/**
 * Follow Controller
 */
const followService = require('../services/followService');
const { success, error } = require('../utils/response');

exports.followUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const followerId = req.userId;
    const result = await followService.followUser(followerId, userId);
    return res.json({ code: 0, message: '关注成功', data: result });
  } catch (err) {
    if (err.code === 401) return error(res, 401, 'AUTH_FAILED', err.message);
    if (err.code === 404) return error(res, 404, 'USER_NOT_FOUND', err.message);
    if (err.code === 400 && err.alreadyExists) return error(res, 400, 'FOLLOW_EXISTS', err.message);
    if (err.code === 400) return error(res, 400, 'PARAM_ERROR', err.message);
    next(err);
  }
};

exports.unfollowUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const followerId = req.userId;
    const result = await followService.unfollowUser(followerId, userId);
    return res.json({ code: 0, message: '取消关注成功', data: result });
  } catch (err) {
    if (err.code === 401) return error(res, 401, 'AUTH_FAILED', err.message);
    if (err.code === 400) return error(res, 400, 'FOLLOW_NOT_EXISTS', err.message);
    next(err);
  }
};

exports.getFollowStatus = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const followerId = req.userId;
    const result = await followService.getFollowStatus(followerId, userId);
    return res.json({ code: 0, message: 'success', data: result });
  } catch (err) {
    next(err);
  }
};

exports.getFollowers = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { page, pageSize } = req.query;
    const result = await followService.getFollowers(userId, { page, pageSize });
    return res.json({ code: 0, message: 'success', data: result });
  } catch (err) {
    next(err);
  }
};

exports.getFollowing = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { page, pageSize } = req.query;
    const result = await followService.getFollowing(userId, { page, pageSize });
    return res.json({ code: 0, message: 'success', data: result });
  } catch (err) {
    next(err);
  }
};
