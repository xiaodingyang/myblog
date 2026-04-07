const mongoose = require('mongoose');

const visitSchema = new mongoose.Schema({
  // 访问的页面 URL
  url: {
    type: String,
    required: [true, '访问 URL 不能为空'],
    trim: true,
    maxlength: [500, 'URL 不能超过500个字符'],
  },
  // 页面标题
  title: {
    type: String,
    default: '',
    trim: true,
    maxlength: [200, '标题不能超过200个字符'],
  },
  // 来源页面
  referrer: {
    type: String,
    default: '',
    trim: true,
    maxlength: [500, '来源 URL 不能超过500个字符'],
  },
  // 用户代理（浏览器信息）
  userAgent: {
    type: String,
    default: '',
    maxlength: [500, 'User Agent 不能超过500个字符'],
  },
  // 访客 IP 地址
  ip: {
    type: String,
    default: '',
    maxlength: [50, 'IP 地址不能超过50个字符'],
  },
  // 访问时间戳
  timestamp: {
    type: Date,
    default: Date.now,
    index: true,
  },
  // 会话 ID（用于区分 UV）
  sessionId: {
    type: String,
    required: [true, '会话 ID 不能为空'],
    trim: true,
    index: true,
  },
  // 用户 ID（可选，已登录用户）
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
}, {
  timestamps: true,
});

// 索引优化查询性能
visitSchema.index({ url: 1, timestamp: -1 });
visitSchema.index({ sessionId: 1, timestamp: -1 });
visitSchema.index({ timestamp: -1 });
visitSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Visit', visitSchema);
