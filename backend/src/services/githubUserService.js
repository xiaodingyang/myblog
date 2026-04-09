/**
 * GithubUser Service
 */
const { GithubUser, Comment, Message } = require('../models');

async function getUsers({ page = 1, pageSize = 10, keyword, status } = {}) {
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
    GithubUser.find(query).sort({ createdAt: -1 }).skip(skip).limit(parseInt(pageSize)),
    GithubUser.countDocuments(query),
  ]);
  return { list: users, total, page: parseInt(page), pageSize: parseInt(pageSize) };
}

async function updateUserStatus(id, status) {
  if (!['active', 'banned'].includes(status)) {
    const err = new Error('无效的状态值');
    err.code = 400;
    throw err;
  }
  const user = await GithubUser.findByIdAndUpdate(id, { status }, { new: true });
  if (!user) {
    const err = new Error('用户不存在');
    err.code = 404;
    throw err;
  }
  return user;
}

async function deleteUser(id) {
  const user = await GithubUser.findByIdAndDelete(id);
  if (!user) {
    const err = new Error('用户不存在');
    err.code = 404;
    throw err;
  }
  await Promise.all([
    Comment.deleteMany({ user: id }),
    Message.updateMany({ user: id }, { $unset: { user: '' } }),
  ]);
  return user;
}

module.exports = { getUsers, updateUserStatus, deleteUser };
