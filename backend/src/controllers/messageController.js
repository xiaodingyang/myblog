const { Message } = require('../models');

exports.getMessages = async (req, res, next) => {
  try {
    const { page = 1, pageSize = 20 } = req.query;

    const query = { status: 'approved' };

    const skip = (parseInt(page) - 1) * parseInt(pageSize);
    const [messages, total] = await Promise.all([
      Message.find(query)
        .populate('user', 'username nickname avatar htmlUrl')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(pageSize)),
      Message.countDocuments(query),
    ]);

    res.json({
      code: 0,
      message: 'success',
      data: {
        list: messages,
        total,
        page: parseInt(page),
        pageSize: parseInt(pageSize),
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.createMessage = async (req, res, next) => {
  try {
    const { content } = req.body;

    const message = await Message.create({
      user: req.githubUserId,
      nickname: req.githubUser.nickname || req.githubUser.username,
      content,
      status: 'pending',
    });

    const populated = await message.populate('user', 'username nickname avatar htmlUrl');

    res.status(201).json({
      code: 0,
      message: '留言提交成功，等待审核',
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 获取留言列表（后台，返回所有）
 */
exports.getAdminMessages = async (req, res, next) => {
  try {
    const { page = 1, pageSize = 10, status } = req.query;

    const query = {};
    if (status) {
      query.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(pageSize);
    const [messages, total] = await Promise.all([
      Message.find(query)
        .populate('user', 'username nickname avatar htmlUrl')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(pageSize)),
      Message.countDocuments(query),
    ]);

    res.json({
      code: 0,
      message: 'success',
      data: {
        list: messages,
        total,
        page: parseInt(page),
        pageSize: parseInt(pageSize),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 审核留言
 */
exports.reviewMessage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const message = await Message.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!message) {
      return res.status(404).json({
        code: 404,
        message: '留言不存在',
        data: null,
      });
    }

    res.json({
      code: 0,
      message: status === 'approved' ? '审核通过' : '已拒绝',
      data: message,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 删除留言
 */
exports.deleteMessage = async (req, res, next) => {
  try {
    const { id } = req.params;

    const message = await Message.findByIdAndDelete(id);

    if (!message) {
      return res.status(404).json({
        code: 404,
        message: '留言不存在',
        data: null,
      });
    }

    res.json({
      code: 0,
      message: '删除成功',
      data: null,
    });
  } catch (error) {
    next(error);
  }
};
