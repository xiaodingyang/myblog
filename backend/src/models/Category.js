const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, '分类名称不能为空'],
    unique: true,
    trim: true,
    maxlength: [20, '分类名称不能超过20个字符'],
  },
  description: {
    type: String,
    default: '',
    maxlength: [100, '描述不能超过100个字符'],
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// 虚拟字段：文章数量
categorySchema.virtual('articleCount', {
  ref: 'Article',
  localField: '_id',
  foreignField: 'category',
  count: true,
});

// 注意：unique: true 已经会自动创建索引，无需再手动定义

module.exports = mongoose.model('Category', categorySchema);
