/**
 * AI 答疑（公开：依赖 articleId + 站内正文，密钥在服务端）
 */
const express = require('express');
const rateLimit = require('express-rate-limit');
const ErrorCode = require('../config/errorCode');
const { optionalAuth } = require('../middlewares/auth');
const aiAskController = require('../controllers/aiAskController');

const router = express.Router();

const isProd = process.env.NODE_ENV === 'production';
const windowMs = 60 * 60 * 1000;

const anonLimit = Math.min(
  Math.max(parseInt(process.env.AI_ASK_HOURLY_LIMIT_IP_ANON, 10) || (isProd ? 5 : 200), 1),
  500,
);
const anonLimiter = rateLimit({
  windowMs,
  max: anonLimit,
  message: { code: ErrorCode.AI_ASK_RATE_LIMITED, message: 'AI 答疑请求过于频繁，请稍后再试', data: null },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => !isProd || !!(req.githubUserId || req.userId),
  // 不显式写 keyGenerator：使用库内置 IPv6 安全的 IP 限流 key（避免 ERR_ERL_KEY_GEN_IPV6）
});

const userLimit = Math.min(
  Math.max(parseInt(process.env.AI_ASK_HOURLY_LIMIT_USER, 10) || (isProd ? 20 : 200), 5),
  500,
);
const userLimiter = rateLimit({
  windowMs,
  max: userLimit,
  message: { code: ErrorCode.AI_ASK_RATE_LIMITED, message: 'AI 答疑请求过于频繁，请稍后再试', data: null },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => !isProd || !(req.githubUserId || req.userId),
  keyGenerator: (req) => String(req.githubUserId || req.userId || 'unknown'),
});

router.post('/ask', optionalAuth, anonLimiter, userLimiter, aiAskController.askArticle);
router.post('/chat', optionalAuth, anonLimiter, userLimiter, aiAskController.askGeneral);

module.exports = router;
