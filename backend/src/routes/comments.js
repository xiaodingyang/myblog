const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const { githubAuth } = require('../middlewares/auth');
const { validate, schemas } = require('../middlewares/validate');

router.get('/article/:articleId', commentController.getArticleComments);

router.post('/', githubAuth, validate(schemas.comment), commentController.createComment);

// 点赞/取消点赞
router.post('/:id/like', githubAuth, commentController.likeComment);

module.exports = router;
