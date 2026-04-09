/**
 * Auth Controller
 */
const authService = require('../services/authService');
const { success, error } = require('../utils/response');

exports.register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    const result = await authService.register({ username, email, password });
    return res.status(201).json({ code: 0, message: '注册成功', data: result });
  } catch (err) {
    if (err.code === 400) return error(res, 400, 'PARAM_ERROR', err.message);
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const result = await authService.login({ username, password });
    return res.json({ code: 0, message: '登录成功', data: result });
  } catch (err) {
    if (err.code === 401) return error(res, 401, 'AUTH_FAILED', err.message);
    next(err);
  }
};

exports.getProfile = async (req, res, next) => {
  try {
    return res.json({ code: 0, message: 'success', data: req.user });
  } catch (err) {
    next(err);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const { username, email, avatar } = req.body;
    const user = await authService.updateProfile(req.userId, { username, email, avatar });
    return success(res, user, '更新成功');
  } catch (err) {
    if (err.code === 400) return error(res, 400, 'PARAM_ERROR', err.message);
    next(err);
  }
};

exports.updatePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;
    await authService.updatePassword(req.userId, { oldPassword, newPassword });
    return res.json({ code: 0, message: '密码修改成功', data: null });
  } catch (err) {
    if (err.code === 400) return error(res, 400, 'PARAM_ERROR', err.message);
    next(err);
  }
};
