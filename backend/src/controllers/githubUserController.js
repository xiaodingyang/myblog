const { GithubUser, Comment, Message } = require('../models');

exports.getUsers = async (req, res, next) => {
  try {
    const { page = 1, pageSize = 10, keyword, status } = req.query;

    const query = {};
    if (status) query.status = status;
    if (keyword) {
      query.$or = [
        { username: { $regex: keyword, $options: 'i' } },
        { nickname: { $regex: keyword, $options: 'i' } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(pageSize);

    const [users, total] = await Promise.all([
      GithubUser.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(pageSize)),
      GithubUser.countDocuments(query),
    ]);

    res.json({
      code: 0,
      message: 'success',
      data: { list: users, total, page: parseInt(page), pageSize: parseInt(pageSize) },
    });
  } catch (error) {
    next(error);
  }
};

exports.updateUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['active', 'banned'].includes(status)) {
      return res.status(400).json({ code: 400, message: '无效的状态值', data: null });
    }

    const user = await GithubUser.findByIdAndUpdate(id, { status }, { new: true });
    if (!user) {
      return res.status(404).json({ code: 404, message: '用户不存在', data: null });
    }

    res.json({
      code: 0,
      message: status === 'active' ? '已解封' : '已封禁',
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await GithubUser.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({ code: 404, message: '用户不存在', data: null });
    }

    await Promise.all([
      Comment.deleteMany({ user: id }),
      Message.updateMany({ user: id }, { $unset: { user: '' } }),
    ]);

    res.json({ code: 0, message: '删除成功', data: null });
  } catch (error) {
    next(error);
  }
};
