/**
 * GithubUser Controller
 */
const githubUserService = require('../services/githubUserService');
const { success, error } = require('../utils/response');

exports.getUsers = async (req, res, next) => {
  try {
    const { page, pageSize, keyword, status } = req.query;
    const result = await githubUserService.getUsers({ page, pageSize, keyword, status });
    return res.json({ code: 0, message: 'success', data: result });
  } catch (err) {
    next(err);
  }
};

exports.updateUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const user = await githubUserService.updateUserStatus(id, status);
    return success(res, user, status === 'active' ? '已解封' : '已封禁');
  } catch (err) {
    if (err.code === 400) return error(res, 400, 'PARAM_ERROR', err.message);
    if (err.code === 404) return error(res, 404, 'USER_NOT_FOUND', err.message);
    next(err);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    await githubUserService.deleteUser(id);
    return success(res, null, '删除成功');
  } catch (err) {
    if (err.code === 404) return error(res, 404, 'USER_NOT_FOUND', err.message);
    next(err);
  }
};
