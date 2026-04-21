// 错误日志中间件 - 避免泄露敏感信息

const { ApiError } = require('../utils/response');

const sanitizeError = (err) => {
  // 移除敏感字段
  const sanitized = { ...err };

  // 删除可能包含敏感信息的字段
  delete sanitized.config;
  delete sanitized.request;
  delete sanitized.response;

  // 如果是 MongoDB 错误，清理堆栈信息
  if (err.name === 'MongoError' || err.name === 'MongoServerError') {
    sanitized.stack = undefined;
  }

  return sanitized;
};

const errorLogger = (err, req, res, next) => {
  const isProd = process.env.NODE_ENV === 'production';

  // 构建日志对象
  const logData = {
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('user-agent'),
    error: {
      name: err.name,
      message: err.message,
      code: err.code,
    }
  };

  // 非生产环境记录完整堆栈
  if (!isProd) {
    logData.error.stack = err.stack;
  }

  // 记录错误（生产环境应使用专业日志服务）
  console.error('[ERROR]', JSON.stringify(logData, null, 2));

  next(err);
};

const errorHandler = (err, req, res, next) => {
  const isProd = process.env.NODE_ENV === 'production';

  // 业务层显式抛出的 API 错误：固定 HTTP/业务码与文案，不走下方泛化分支（避免与 Mongo 等 err.code 混淆）
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      code: err.code,
      message: err.message,
      data: null,
      ...(!isProd && err.stack ? { stack: err.stack } : {}),
    });
  }

  // 默认错误响应（兼容 Express 常用的 err.status）
  let statusCode = err.status || err.statusCode || 500;
  let code = err.code || 10000;
  let message = err.message || '服务器内部错误';
  const origMsg = String(err.message || '');

  // 生产环境隐藏详细错误信息
  if (isProd && statusCode === 500) {
    message = '服务器内部错误，请稍后重试';
  }

  // MongoDB 错误处理（勿与 express-rate-limit 的 ValidationError 混淆）
  if (err.name === 'ValidationError' && !origMsg.includes('ERR_ERL_')) {
    statusCode = 400;
    code = 10001;
    message = '数据验证失败';
  }

  if (err.name === 'CastError') {
    statusCode = 400;
    code = 10001;
    message = '无效的数据格式';
  }

  if (err.code === 11000) {
    statusCode = 400;
    code = 10002;
    message = '数据已存在';
  }

  // JWT 错误处理
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    code = 10003;
    message = '无效的认证令牌';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    code = 10004;
    message = '认证令牌已过期';
  }

  // express-rate-limit v8+：存在 X-Forwarded-For 但未正确配置 trust proxy 时会抛 ERR_ERL_*
  if (origMsg.includes('ERR_ERL_')) {
    statusCode = 503;
    code = 10007;
    message =
      '网关与 Node 之间的 IP 转发配置异常（常见于未启用 Express trust proxy）。请在服务器 backend/.env.production 设置 TRUST_PROXY=1 后执行 pm2 restart blog-backend';
  }

  // 响应错误
  res.status(statusCode).json({
    code,
    message,
    data: null,
    // 非生产环境返回堆栈信息
    ...((!isProd && err.stack) && { stack: err.stack })
  });
};

module.exports = {
  errorLogger,
  errorHandler,
  sanitizeError
};
