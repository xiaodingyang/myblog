/**
 * Message Controller
 */
const messageService = require('../services/messageService');
const { success, error } = require('../utils/response');

exports.getMessages = async (req, res, next) => {
  try {
    const { page, pageSize } = req.query;
    const result = await messageService.getMessages({ page, pageSize });
    return res.json({ code: 0, message: 'success', data: result });
  } catch (err) {
    next(err);
  }
};

exports.createMessage = async (req, res, next) => {
  try {
    const { content } = req.body;
    const message = await messageService.createMessage({
      content,
      user: req.githubUserId,
      nickname: req.githubUser?.nickname || req.githubUser?.username,
    });
    return res.status(201).json({ code: 0, message: '留言提交成功，等待审核', data: message });
  } catch (err) {
    next(err);
  }
};

exports.getAdminMessages = async (req, res, next) => {
  try {
    const { page, pageSize, status } = req.query;
    const result = await messageService.getAdminMessages({ page, pageSize, status });
    return res.json({ code: 0, message: 'success', data: result });
  } catch (err) {
    next(err);
  }
};

exports.reviewMessage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const message = await messageService.reviewMessage(id, status);
    if (!message) return error(res, 404, 'NOT_FOUND', '留言不存在');
    return success(res, message, status === 'approved' ? '审核通过' : '已拒绝');
  } catch (err) {
    next(err);
  }
};

exports.deleteMessage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const message = await messageService.deleteMessage(id);
    if (!message) return error(res, 404, 'NOT_FOUND', '留言不存在');
    return success(res, null, '删除成功');
  } catch (err) {
    next(err);
  }
};
