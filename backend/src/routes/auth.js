const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { auth } = require('../middlewares/auth');
const { validate, schemas } = require('../middlewares/validate');

// 用户注册
router.post('/register', validate(schemas.register), authController.register);

// 用户登录
router.post('/login', validate(schemas.login), authController.login);

// 获取当前用户信息
router.get('/profile', auth, authController.getProfile);

// 更新当前用户信息
router.put('/profile', auth, authController.updateProfile);

// 修改密码
router.put('/password', auth, authController.updatePassword);

module.exports = router;
