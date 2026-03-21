const mongoose = require('mongoose');

const githubUserSchema = new mongoose.Schema({
  githubId: {
    type: Number,
    required: true,
    unique: true,
  },
  username: {
    type: String,
    required: true,
  },
  nickname: {
    type: String,
    default: '',
  },
  avatar: {
    type: String,
    default: '',
  },
  email: {
    type: String,
    default: '',
  },
  bio: {
    type: String,
    default: '',
  },
  htmlUrl: {
    type: String,
    default: '',
  },
  status: {
    type: String,
    enum: ['active', 'banned'],
    default: 'active',
  },
  lastLoginAt: {
    type: Date,
    default: Date.now,
  },
  themeId: {
    type: String,
    default: '',
  },
}, {
  timestamps: true,
  toJSON: {
    transform: (doc, ret) => {
      delete ret.__v;
      return ret;
    },
  },
});

githubUserSchema.index({ username: 1 });

module.exports = mongoose.model('GithubUser', githubUserSchema);
