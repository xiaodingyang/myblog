const express = require('express');
const router = express.Router();
const favoriteController = require('../controllers/favoriteController');
const { githubAuth } = require('../middlewares/auth');

router.get('/', githubAuth, favoriteController.listFavorites);
router.post('/', githubAuth, favoriteController.addFavorite);
router.delete('/:articleId', githubAuth, favoriteController.removeFavorite);

module.exports = router;
