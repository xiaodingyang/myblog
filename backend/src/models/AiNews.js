/**
 * AI News Model
 */
const mongoose = require('mongoose');

const aiNewsSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, '新闻标题不能为空'],
    trim: true,
  },
  source: {
    type: {
      id: { type: String },
      name: { type: String },
    },
    required: true,
  },
  publishedAt: {
    type: Date,
    required: [true, '发布时间不能为空'],
  },
  summary: {
    type: String,
    default: '',
  },
  tags: [{
    type: String,
  }],
  url: {
    type: String,
    required: [true, '新闻链接不能为空'],
    trim: true,
  },
  imageUrl: {
    type: String,
    default: '',
  },
  // 新闻唯一标识（用于去重）
  articleId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// 复合索引：按发布时间倒序
aiNewsSchema.index({ publishedAt: -1 });

// 复合索引：按创建时间倒序（用于最新新闻）
aiNewsSchema.index({ createdAt: -1 });

// 复合索引：来源+articleId 用于去重查询
aiNewsSchema.index({ 'source.id': 1, articleId: 1 });

module.exports = mongoose.model('AiNews', aiNewsSchema);
