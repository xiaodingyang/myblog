// 加载环境变量（如果 .env 文件存在）
try {
  require('dotenv').config();
} catch (e) {
  console.log('ℹ️  No .env file found, using default configuration');
}

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const connectDB = require('./config/database');
const errorHandler = require('./middlewares/errorHandler');
const routes = require('./routes');

const app = express();

// 连接数据库
connectDB();

// 安全中间件
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// CORS：允许任意来源（origin: '*' 与 credentials: true 不能同时使用）
app.use(cors({
  origin: '*',
  credentials: false,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 响应压缩
const compression = require('compression');
app.use(compression());

// API 限流（生产环境严格；本地/测试放宽，避免 E2E 高频请求误伤登录）
const isProd = process.env.NODE_ENV === 'production';
const envWindowMs = Number(process.env.API_RATE_LIMIT_WINDOW_MS);
const envMax = Number(process.env.API_RATE_LIMIT_MAX);
const windowMs = Number.isFinite(envWindowMs) && envWindowMs > 0
  ? envWindowMs
  : (isProd ? 15 * 60 * 1000 : 5 * 60 * 1000);
const max = Number.isFinite(envMax) && envMax > 0
  ? envMax
  : (isProd ? 100 : 10000); // 开发环境提高到10000次

const apiLimiter = rateLimit({
  windowMs,
  max,
  message: { code: 10008, message: '请求过于频繁，请稍后再试', data: null },
  standardHeaders: true,
  legacyHeaders: false,
  // 开发环境完全禁用限流
  skip: (req) => {
    // 非生产环境跳过限流
    if (!isProd) return true;

    // 从 Authorization header 中提取 token
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return false;

    try {
      const jwt = require('jsonwebtoken');
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      // 管理员用户 ruofeng 不受限制
      return decoded.username === 'ruofeng';
    } catch (err) {
      return false;
    }
  },
});

// 静态文件服务
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// 路由
app.use('/api', apiLimiter, routes);

// RSS (accessible at /api/rss for RSS readers)
const rssRoutes = require('./routes/rss');
app.use('/api/rss', rssRoutes);

// Sitemap (accessible at /sitemap.xml for search engines)
const sitemapRoutes = require('./routes/sitemap');
app.use('/sitemap.xml', sitemapRoutes);
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 处理
app.use((req, res) => {
  res.status(404).json({
    code: 404,
    message: '接口不存在',
    data: null,
  });
});

// 错误处理
app.use(errorHandler);

// 启动服务器
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📝 API docs: http://localhost:${PORT}/api`);
});

// 优雅退出
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

module.exports = app;
