/**
 * 统一 API 响应工具
 *
 * 格式：{ code: 0, message: 'success', data: {...} }
 *
 * 使用方式：
 *   const { success, error, paginated } = require('@/utils/response');
 *
 *   // 成功响应
 *   success(res);                          // { code: 0, message: 'success', data: null }
 *   success(res, { name: 'test' });        // { code: 0, message: 'success', data: { name: 'test' } }
 *   success(res, null, '操作成功');         // { code: 0, message: '操作成功', data: null }
 *   success(res, { id: 1 }, '创建成功');   // { code: 0, message: '创建成功', data: { id: 1 } }
 *
 *   // 错误响应
 *   error(res, 404, 'NOT_FOUND', '文章不存在');
 *   error(res, 400, 'PARAM_ERROR', '标题不能为空');
 *
 *   // 分页响应
 *   paginated(res, list, total, page, pageSize);
 */

const ErrorCode = require('../config/errorCode');

/**
 * 成功响应
 * @param {object} res - Express Response
 * @param {any} data - 响应数据
 * @param {string} message - 成功消息
 */
function success(res, data = null, message = 'success') {
  return res.json({
    code: ErrorCode.SUCCESS,
    message,
    data,
  });
}

/**
 * 分页响应
 * @param {object} res - Express Response
 * @param {Array} list - 数据列表
 * @param {number} total - 总数
 * @param {number} page - 当前页
 * @param {number} pageSize - 每页条数
 * @param {string} message - 成功消息
 */
function paginated(res, list, total, page, pageSize, message = 'success') {
  return res.json({
    code: ErrorCode.SUCCESS,
    message,
    data: { list, total, page, pageSize },
  });
}

/**
 * 错误响应
 * @param {object} res - Express Response
 * @param {number} httpStatus - HTTP 状态码
 * @param {string|number} errorCode - 错误码（常量名或数字）
 * @param {string} message - 错误消息
 */
function error(res, httpStatus, errorCode, message) {
  // 支持传入 ErrorCode 常量名或数字
  const code = typeof errorCode === 'string' ? ErrorCode[errorCode] : errorCode;

  return res.status(httpStatus).json({
    code,
    message,
    data: null,
  });
}

/**
 * 抛出统一错误（供 next(err) 使用）
 * 创建带有统一错误码的 Error 对象
 */
class ApiError extends Error {
  constructor(httpStatus, errorCode, message) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = httpStatus;
    /** Express 惯例字段，便于中间件与日志统一识别 */
    this.status = httpStatus;
    this.code = typeof errorCode === 'string' ? ErrorCode[errorCode] : errorCode;
  }
}

module.exports = {
  success,
  paginated,
  error,
  ApiError,
};
