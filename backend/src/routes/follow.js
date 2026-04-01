const express = require('express');
const router = express.Router();
const followController = require('../controllers/followController');
const { auth } = require('../middlewares/auth');

// 关注用户（需登录）
router.post('/:userId', auth, followController.followUser);

// 取消关注（需登录）
router.delete('/:userId', auth, followController.unfollowUser);

// 查询关注状态
router.get('/:userId/status', followController.getFollowStatus);

// 获取粉丝列表
router.get('/:userId/followers', followController.getFollowers);

// 获取关注列表
router.get('/:userId/following', followController.getFollowing);

module.exports = router;
