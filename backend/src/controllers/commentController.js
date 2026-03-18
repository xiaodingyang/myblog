const { Comment, Article } = require('../models');

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

exports.createComment = async (req, res, next) => {
  try {
    const { articleId, content } = req.body;

    const article = await Article.findById(articleId);
    if (!article) {
      return res.status(404).json({ code: 404, message: '文章不存在', data: null });
    }

    const comment = await Comment.create({
      articleId,
      user: req.githubUserId,
      content,
    });

    const populated = await comment.populate('user', 'username nickname avatar htmlUrl');

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
