const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'GithubUser',
  },
  nickname: {
    type: String,
    trim: true,
    maxlength: [20, '昵称不能超过20个字符'],
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
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

messageSchema.index({ status: 1 });
messageSchema.index({ createdAt: -1 });
messageSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Message', messageSchema);
