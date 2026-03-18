const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  articleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Article',
    required: true,
    index: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'GithubUser',
    required: true,
  },
  content: {
    type: String,
    required: [true, '评论内容不能为空'],
    trim: true,
    maxlength: [500, '评论内容不能超过500个字符'],
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'approved',
  },
}, {
  timestamps: true,
});

commentSchema.index({ articleId: 1, createdAt: -1 });

module.exports = mongoose.model('Comment', commentSchema);
