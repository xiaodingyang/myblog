const { Comment, Article, Notification } = require('../models');

// ========== 评论频率限制 ==========
const commentRateMap = new Map(); // key: userId, value: lastCommentTime
const COMMENT_COOLDOWN = 30 * 1000; // 30秒

exports.getArticleComments = async (req, res, next) => {
  try {
    const { articleId } = req.params;
    const { page = 1, pageSize = 20 } = req.query;

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

    res.json({
      code: 0,
      message: 'success',
      data: { list: comments, total, page: parseInt(page), pageSize: parseInt(pageSize) },
    });
  } catch (error) {
    next(error);
  }
};

exports.likeComment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.githubUserId;

    const comment = await Comment.findById(id);
    if (!comment) {
      return res.status(404).json({ code: 404, message: '评论不存在', data: null });
    }

    // 检查用户是否已点赞
    const likedIndex = comment.likes.findIndex(
      like => like.toString() === userId.toString()
    );

    let liked;
    if (likedIndex > -1) {
      // 已点赞，取消点赞
      comment.likes.splice(likedIndex, 1);
      comment.likeCount = Math.max(0, comment.likes.length);
      liked = false;
    } else {
      // 未点赞，添加点赞
      comment.likes.push(userId);
      comment.likeCount = comment.likes.length;
      liked = true;
    }

    await comment.save();

    res.json({
      code: 0,
      message: liked ? '点赞成功' : '已取消点赞',
      data: { liked, likeCount: comment.likeCount },
    });
  } catch (error) {
    next(error);
  }
};

exports.createComment = async (req, res, next) => {
  try {
    const { articleId, content } = req.body;
    const userId = req.githubUserId;

    // 评论频率限制：同一用户30秒内最多1条
    const lastTime = commentRateMap.get(userId?.toString());
    if (lastTime && Date.now() - lastTime < COMMENT_COOLDOWN) {
      return res.status(429).json({ code: 429, message: '评论太频繁，请稍后再试' });
    }

    const article = await Article.findById(articleId);
    if (!article) {
      return res.status(404).json({ code: 404, message: '文章不存在', data: null });
    }

    const comment = await Comment.create({
      articleId,
      user: req.githubUserId,
      content,
    });

    // 记录评论时间
    commentRateMap.set(userId?.toString(), Date.now());

    const populated = await comment.populate('user', 'username nickname avatar htmlUrl');

    // 创建通知：给该文章下的其他评论者发通知
    try {
      const otherComments = await Comment.find({
        articleId,
        user: { $ne: req.githubUserId },
        status: 'approved',
      }).distinct('user');

      if (otherComments.length > 0) {
        const contentPreview = content.length > 50 ? content.slice(0, 50) + '...' : content;
        const notifications = otherComments.map(toUserId => ({
          type: 'reply',
          fromUser: req.githubUserId,
          toUser: toUserId,
          articleId,
          commentId: comment._id,
          content: contentPreview,
        }));
        await Notification.insertMany(notifications);
      }
    } catch (notifErr) {
      // 通知创建失败不影响评论发表
      console.error('Failed to create notifications:', notifErr);
    }

    res.status(201).json({
      code: 0,
      message: '评论发表成功',
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

exports.getAdminComments = async (req, res, next) => {
  try {
    const { page = 1, pageSize = 10, status, articleId } = req.query;

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

    res.json({
      code: 0,
      message: 'success',
      data: { list: comments, total, page: parseInt(page), pageSize: parseInt(pageSize) },
    });
  } catch (error) {
    next(error);
  }
};

exports.reviewComment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const comment = await Comment.findByIdAndUpdate(id, { status }, { new: true });
    if (!comment) {
      return res.status(404).json({ code: 404, message: '评论不存在', data: null });
    }

    res.json({
      code: 0,
      message: status === 'approved' ? '审核通过' : '已拒绝',
      data: comment,
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteComment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const comment = await Comment.findByIdAndDelete(id);
    if (!comment) {
      return res.status(404).json({ code: 404, message: '评论不存在', data: null });
    }
    res.json({ code: 0, message: '删除成功', data: null });
  } catch (error) {
    next(error);
  }
};
