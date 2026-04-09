/**
 * Comment Service
 */
const { Comment, Article, Notification } = require('../models');

// ========== 评论频率限制 ==========
const commentRateMap = new Map();
const COMMENT_COOLDOWN = 30 * 1000;

/**
 * 获取文章评论列表
 */
async function getArticleComments(articleId, { page = 1, pageSize = 20 } = {}) {
  const query = { articleId, status: 'approved' };
  const skip = (parseInt(page) - 1) * parseInt(pageSize);
  const [comments, total] = await Promise.all([
    Comment.find(query)
      .populate('user', 'username nickname avatar htmlUrl')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(pageSize)),
    Comment.countDocuments(query),
  ]);
  return { list: comments, total, page: parseInt(page), pageSize: parseInt(pageSize) };
}

/**
 * 点赞/取消评论
 */
async function likeComment(id, userId) {
  const comment = await Comment.findById(id);
  if (!comment) return null;

  const likedIndex = comment.likes.findIndex(like => like.toString() === userId.toString());
  let liked;
  if (likedIndex > -1) {
    comment.likes.splice(likedIndex, 1);
    comment.likeCount = Math.max(0, comment.likes.length);
    liked = false;
  } else {
    comment.likes.push(userId);
    comment.likeCount = comment.likes.length;
    liked = true;
  }
  await comment.save();
  return { liked, likeCount: comment.likeCount };
}

/**
 * 创建评论（含频率限制 + 通知）
 */
async function createComment({ articleId, content, userId }) {
  // 频率限制
  const lastTime = commentRateMap.get(userId?.toString());
  if (lastTime && Date.now() - lastTime < COMMENT_COOLDOWN) {
    const err = new Error('评论太频繁，请稍后再试');
    err.code = 429;
    err.errorCode = 'COMMENT_RATE_LIMITED';
    throw err;
  }

  const article = await Article.findById(articleId);
  if (!article) {
    const err = new Error('文章不存在');
    err.code = 404;
    err.errorCode = 'ARTICLE_NOT_FOUND';
    throw err;
  }

  const comment = await Comment.create({ articleId, user: userId, content });
  commentRateMap.set(userId?.toString(), Date.now());

  const populated = await comment.populate('user', 'username nickname avatar htmlUrl');

  // 异步创建通知（不阻塞评论发布）
  createReplyNotifications(articleId, userId, content).catch(err => {
    console.error('Failed to create notifications:', err);
  });

  return populated;
}

/**
 * 创建回复通知（内部使用，不抛出错误）
 */
async function createReplyNotifications(articleId, fromUserId, content) {
  const otherComments = await Comment.find({
    articleId,
    user: { $ne: fromUserId },
    status: 'approved',
  }).distinct('user');

  if (otherComments.length > 0) {
    const contentPreview = content.length > 50 ? content.slice(0, 50) + '...' : content;
    const notifications = otherComments.map(toUserId => ({
      type: 'reply',
      fromUser: fromUserId,
      toUser: toUserId,
      articleId,
      content: contentPreview,
    }));
    await Notification.insertMany(notifications);
  }
}

/**
 * 获取评论列表（后台）
 */
async function getAdminComments({ page = 1, pageSize = 10, status, articleId } = {}) {
  const query = {};
  if (status) query.status = status;
  if (articleId) query.articleId = articleId;

  const skip = (parseInt(page) - 1) * parseInt(pageSize);
  const [comments, total] = await Promise.all([
    Comment.find(query)
      .populate('user', 'username nickname avatar')
      .populate('articleId', 'title')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(pageSize)),
    Comment.countDocuments(query),
  ]);
  return { list: comments, total, page: parseInt(page), pageSize: parseInt(pageSize) };
}

/**
 * 审核评论
 */
async function reviewComment(id, status) {
  return Comment.findByIdAndUpdate(id, { status }, { new: true });
}

/**
 * 删除评论
 */
async function deleteComment(id) {
  return Comment.findByIdAndDelete(id);
}

module.exports = {
  getArticleComments,
  likeComment,
  createComment,
  getAdminComments,
  reviewComment,
  deleteComment,
};
