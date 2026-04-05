const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  type: { type: String, enum: ['reply', 'like'], required: true },
  fromUser: { type: mongoose.Schema.Types.ObjectId, ref: 'GithubUser', required: true },
  toUser: { type: mongoose.Schema.Types.ObjectId, ref: 'GithubUser', required: true },
  articleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Article' },
  commentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment' },
  content: { type: String },
  isRead: { type: Boolean, default: false },
}, { timestamps: true });

notificationSchema.index({ toUser: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
