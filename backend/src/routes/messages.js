const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const { validate, schemas } = require('../middlewares/validate');

// 获取留言列表（前台，已审核的）
router.get('/', messageController.getMessages);

// 提交留言
router.post('/', validate(schemas.message), messageController.createMessage);

module.exports = router;
