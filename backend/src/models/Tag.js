const mongoose = require('mongoose');

const tagSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, '标签名称不能为空'],
    unique: true,
    trim: true,
    maxlength: [20, '标签名称不能超过20个字符'],
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// 虚拟字段：文章数量
tagSchema.virtual('articleCount', {
  ref: 'Article',
  localField: '_id',
  foreignField: 'tags',
  count: true,
});

// 注意：unique: true 已经会自动创建索引，无需再手动定义

module.exports = mongoose.model('Tag', tagSchema);
