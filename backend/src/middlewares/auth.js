const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt');
const { User } = require('../models');

/**
 * JWT 认证中间件
 */
const auth = async (req, res, next) => {
  try {
    // 获取 token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        code: 401,
        message: '未登录或登录已过期',
        data: null,
      });
    }

    const token = authHeader.split(' ')[1];

    // 验证 token
    const decoded = jwt.verify(token, jwtConfig.secret);

    // 查找用户
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        code: 401,
        message: '用户不存在',
        data: null,
      });
    }

    // 将用户信息挂载到 req 对象
    req.user = user;
    req.userId = user._id;

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        code: 401,
        message: '无效的 token',
        data: null,
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        code: 401,
        message: '登录已过期，请重新登录',
        data: null,
      });
    }
    next(error);
  }
};

/**
 * 管理员权限中间件
 */
const adminAuth = async (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      code: 403,
      message: '没有权限执行此操作',
      data: null,
    });
  }
  next();
};

/**
 * 可选认证中间件（不强制登录）
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, jwtConfig.secret);
      const user = await User.findById(decoded.id);
      if (user) {
        req.user = user;
        req.userId = user._id;
      }
    }
  } catch (error) {
    // 忽略认证错误，继续执行
  }
  next();
};

module.exports = {
  auth,
  adminAuth,
  optionalAuth,
};
