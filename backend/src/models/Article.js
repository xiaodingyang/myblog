const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, '文章标题不能为空'],
    trim: true,
    maxlength: [100, '标题不能超过100个字符'],
  },
  content: {
    type: String,
    required: [true, '文章内容不能为空'],
  },
  summary: {
    type: String,
    default: '',
    maxlength: [200, '摘要不能超过200个字符'],
  },
  cover: {
    type: String,
    default: '',
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, '请选择文章分类'],
  },
  tags: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tag',
  }],
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  views: {
    type: Number,
    default: 0,
    min: 0,
  },
  status: {
    type: String,
    enum: ['draft', 'published'],
    default: 'draft',
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// 自动生成摘要
articleSchema.pre('save', function(next) {
  if (!this.summary && this.content) {
    // 移除 markdown 标记，取前150个字符
    const plainText = this.content
      .replace(/#+\s/g, '')
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .replace(/`{1,3}[^`]*`{1,3}/g, '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/\n/g, ' ')
      .trim();
    this.summary = plainText.substring(0, 150) + (plainText.length > 150 ? '...' : '');
  }
  next();
});

// 索引
articleSchema.index({ title: 'text', content: 'text' });
articleSchema.index({ category: 1 });
articleSchema.index({ tags: 1 });
articleSchema.index({ status: 1 });
articleSchema.index({ createdAt: -1 });
articleSchema.index({ views: -1 });

module.exports = mongoose.model('Article', articleSchema);
