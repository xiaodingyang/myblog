const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const { githubAuth } = require('../middlewares/auth');

router.get('/article/:articleId', commentController.getArticleComments);

router.post('/', githubAuth, commentController.createComment);

module.exports = router;
