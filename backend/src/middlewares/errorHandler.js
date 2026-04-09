/**
 * 全局错误处理中间件
 *
 * 统一错误码：
 * - 错误响应格式：{ code: <ErrorCode>, message: <string>, data: null }
 */
const ErrorCode = require('../config/errorCode');

const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Mongoose 验证错误
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({
      code: ErrorCode.PARAM_ERROR,
      message: messages[0] || '数据验证失败',
      data: null,
    });
  }

  // Mongoose 重复键错误
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    const fieldNames = {
      username: '用户名',
      email: '邮箱',
      name: '名称',
    };
    return res.status(400).json({
      code: ErrorCode.PARAM_ERROR,
      message: `${fieldNames[field] || field} 已存在`,
      data: null,
    });
  }

  // Mongoose CastError（无效的 ObjectId）
  if (err.name === 'CastError') {
    return res.status(400).json({
      code: ErrorCode.PARAM_ERROR,
      message: '无效的 ID 格式',
      data: null,
    });
  }

  // JWT 错误
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      code: ErrorCode.TOKEN_INVALID,
      message: '无效的 token',
      data: null,
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      code: ErrorCode.TOKEN_EXPIRED,
      message: '登录已过期',
      data: null,
    });
  }

  // 自定义 ApiError
  if (err.statusCode) {
    return res.status(err.statusCode).json({
      code: err.code || ErrorCode.SERVER_ERROR,
      message: err.message,
      data: null,
    });
  }

  // Multer 错误
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      code: ErrorCode.FILE_TOO_LARGE,
      message: '文件大小超过限制',
      data: null,
    });
  }

  // 默认服务器错误
  res.status(500).json({
    code: ErrorCode.SERVER_ERROR,
    message: process.env.NODE_ENV === 'production' ? '服务器内部错误' : err.message,
    data: null,
  });
};

module.exports = errorHandler;
