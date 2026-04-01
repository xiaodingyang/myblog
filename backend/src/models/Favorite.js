const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema({
  article: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Article',
    required: true,
    index: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'GithubUser',
    required: true,
    index: true,
  },
}, {
  timestamps: true,
});

favoriteSchema.index({ user: 1, article: 1 }, { unique: true });

module.exports = mongoose.model('Favorite', favoriteSchema);
