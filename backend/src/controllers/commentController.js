/**
 * Comment Controller
 */
const commentService = require('../services/commentService');
const { success, error, paginated } = require('../utils/response');

exports.getArticleComments = async (req, res, next) => {
  try {
    const { articleId } = req.params;
    const { page, pageSize } = req.query;
    const result = await commentService.getArticleComments(articleId, { page, pageSize });
    return res.json({ code: 0, message: 'success', data: result });
  } catch (err) {
    next(err);
  }
};

exports.likeComment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.githubUserId;
    const result = await commentService.likeComment(id, userId);
    if (!result) return error(res, 404, 'COMMENT_NOT_FOUND', '评论不存在');
    return success(res, result, result.liked ? '点赞成功' : '已取消点赞');
  } catch (err) {
    next(err);
  }
};

exports.createComment = async (req, res, next) => {
  try {
    const { articleId, content } = req.body;
    const userId = req.githubUserId;
    const comment = await commentService.createComment({ articleId, content, userId });
    return res.status(201).json({ code: 0, message: '评论发表成功', data: comment });
  } catch (err) {
    if (err.code === 429) return error(res, err.code, err.errorCode, err.message);
    if (err.code === 404) return error(res, err.code, err.errorCode, err.message);
    next(err);
  }
};

exports.getAdminComments = async (req, res, next) => {
  try {
    const { page, pageSize, status, articleId } = req.query;
    const result = await commentService.getAdminComments({ page, pageSize, status, articleId });
    return res.json({ code: 0, message: 'success', data: result });
  } catch (err) {
    next(err);
  }
};

exports.reviewComment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const comment = await commentService.reviewComment(id, status);
    if (!comment) return error(res, 404, 'COMMENT_NOT_FOUND', '评论不存在');
    return success(res, comment, status === 'approved' ? '审核通过' : '已拒绝');
  } catch (err) {
    next(err);
  }
};

exports.deleteComment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const comment = await commentService.deleteComment(id);
    if (!comment) return error(res, 404, 'COMMENT_NOT_FOUND', '评论不存在');
    return success(res, null, '删除成功');
  } catch (err) {
    next(err);
  }
};
