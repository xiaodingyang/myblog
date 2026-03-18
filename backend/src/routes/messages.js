const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const { githubAuth } = require('../middlewares/auth');

router.get('/', messageController.getMessages);

router.post('/', githubAuth, messageController.createMessage);

module.exports = router;
