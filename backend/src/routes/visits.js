const express = require('express');
const router = express.Router();
const visitController = require('../controllers/visitController');

// 记录访问
router.post('/', visitController.recordVisit);

module.exports = router;
