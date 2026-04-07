const mongoose = require('mongoose');

const visitSchema = new mongoose.Schema({
  // 访问路径（如 /blog/123）
  path: {
    type: String,
    required: [true, '访问路径不能为空'],
    trim: true,
    maxlength: [500, '路径不能超过500个字符'],
  },
  // 页面标题
  title: {
    type: String,
    default: '',
    trim: true,
    maxlength: [200, '标题不能超过200个字符'],
  },
  // 来源页面 URL（与 HTTP 标准一致用 referer）
  referer: {
    type: String,
    default: '',
    trim: true,
    maxlength: [500, '来源 URL 不能超过500个字符'],
  },
  // 浏览器 User-Agent
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
  // 会话 ID（前端生成，用于 UV 统计）
  sessionId: {
    type: String,
    required: [true, '会话 ID 不能为空'],
    trim: true,
  },
  // 停留时长（秒）
  duration: {
    type: Number,
    default: null,
  },
  // 用户 ID（已登录用户关联）
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
}, {
  timestamps: true,
});

// PRD 索引设计
visitSchema.index({ createdAt: -1 });
visitSchema.index({ path: 1 });
visitSchema.index({ sessionId: 1 });
visitSchema.index({ path: 1, createdAt: -1 });

module.exports = mongoose.model('Visit', visitSchema);
