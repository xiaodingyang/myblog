const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');
const { auth } = require('../middlewares/auth');
const upload = require('../middlewares/upload');

// 文件上传（需要登录）
router.post('/', auth, upload.single('file'), uploadController.uploadFile);

module.exports = router;
