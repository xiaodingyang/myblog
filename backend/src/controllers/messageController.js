const { Message } = require('../models');

/**
 * 获取留言列表（前台，只返回已审核的）
 */
exports.getMessages = async (req, res, next) => {
  try {
    const { page = 1, pageSize = 20 } = req.query;

    const query = { status: 'approved' };

    const skip = (parseInt(page) - 1) * parseInt(pageSize);
    const [messages, total] = await Promise.all([
      Message.find(query)
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
 * 提交留言
 */
exports.createMessage = async (req, res, next) => {
  try {
    const { nickname, email, content } = req.body;

    const message = await Message.create({
      nickname,
      email,
      content,
      status: 'pending',
    });

    res.status(201).json({
      code: 0,
      message: '留言提交成功，等待审核',
      data: message,
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
