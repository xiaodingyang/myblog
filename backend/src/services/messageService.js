/**
 * Message Service
 */
const { Message } = require('../models');

async function getMessages({ page = 1, pageSize = 20 } = {}) {
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
  return { list: messages, total, page: parseInt(page), pageSize: parseInt(pageSize) };
}

async function createMessage({ content, user, nickname }) {
  const message = await Message.create({
    user,
    nickname: nickname || user?.nickname || user?.username,
    content,
    status: 'pending',
  });
  return message.populate('user', 'username nickname avatar htmlUrl');
}

async function getAdminMessages({ page = 1, pageSize = 10, status } = {}) {
  const query = {};
  if (status) query.status = status;
  const skip = (parseInt(page) - 1) * parseInt(pageSize);
  const [messages, total] = await Promise.all([
    Message.find(query)
      .populate('user', 'username nickname avatar htmlUrl')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(pageSize)),
    Message.countDocuments(query),
  ]);
  return { list: messages, total, page: parseInt(page), pageSize: parseInt(pageSize) };
}

async function reviewMessage(id, status) {
  return Message.findByIdAndUpdate(id, { status }, { new: true });
}

async function deleteMessage(id) {
  return Message.findByIdAndDelete(id);
}

module.exports = { getMessages, createMessage, getAdminMessages, reviewMessage, deleteMessage };
