const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  nickname: {
    type: String,
    required: [true, '昵称不能为空'],
    trim: true,
    maxlength: [20, '昵称不能超过20个字符'],
  },
  email: {
    type: String,
    required: [true, '邮箱不能为空'],
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, '请输入有效的邮箱地址'],
  },
  content: {
    type: String,
    required: [true, '留言内容不能为空'],
    trim: true,
    minlength: [5, '留言内容至少5个字符'],
    maxlength: [500, '留言内容不能超过500个字符'],
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
}, {
  timestamps: true,
});

// 索引
messageSchema.index({ status: 1 });
messageSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Message', messageSchema);
