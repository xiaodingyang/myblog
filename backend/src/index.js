const path = require('path');

// 始终从 backend 根目录加载 .env（避免从 monorepo 根目录启动时 cwd 不对读不到变量）
const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env';
const envPath = path.join(__dirname, '..', envFile);
try {
  const envResult = require('dotenv').config({ path: envPath });
  if (envResult.error) {
    console.log(`ℹ️  未加载 ${envPath}: ${envResult.error.message}`);
  } else {
    console.log(`✅ 已加载环境配置: ${envPath}`);
  }
} catch (e) {
  console.log('ℹ️  dotenv 异常，使用进程已有环境变量');
}

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const connectDB = require('./config/database');
const { errorLogger, errorHandler } = require('./middleware/errorHandler');
const routes = require('./routes');

const app = express();

const isProdEnv = process.env.NODE_ENV === 'production';

// 反向代理后正确识别客户端 IP（供 express-rate-limit v8+ 校验与限流 key 使用）
// 生产环境默认开启一层 trust proxy（常见：前面只有 Nginx）；显式 TRUST_PROXY=0/false/off 可关闭
const trustUnset =
  process.env.TRUST_PROXY == null || String(process.env.TRUST_PROXY).trim() === '';
const trustToken = trustUnset ? '' : String(process.env.TRUST_PROXY).trim().toLowerCase();
const trustExplicitOff = ['0', 'false', 'off', 'no'].includes(trustToken);
const trustExplicitOn = ['1', 'true', 'on', 'yes'].includes(trustToken);
const trustProxyOn = trustExplicitOn || (isProdEnv && trustUnset && !trustExplicitOff);
console.log(
  `🔍 TRUST_PROXY: ${trustUnset ? '(未设置)' : `"${process.env.TRUST_PROXY}"`} → ${trustProxyOn ? '开启' : '关闭'} trust proxy`,
);
if (trustProxyOn) {
  app.set('trust proxy', 1);
  console.log('✅ Express trust proxy 已启用（值为 1）');
} else {
  console.log(
    '⚠️  Express trust proxy 未启用：若前有 Nginx 且出现 AI/限流异常，请在 .env.production 设置 TRUST_PROXY=1 后重启',
  );
}

// 连接数据库
connectDB();

// 安全中间件
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// CORS：开发环境宽松，生产环境严格
/**
 * 在 FRONTEND_URL 白名单基础上，为「仅两段式主域」自动补齐 www ⇄ 裸域，避免只配其一导致浏览器报 CORS。
 * 不处理多级子域（如 blog.example.com），以免误放行。
 */
function expandAllowedOrigins(urls) {
  const out = new Set((urls || []).map((u) => String(u || '').trim()).filter(Boolean));
  for (const raw of [...out]) {
    try {
      const u = new URL(raw);
      const proto = u.protocol;
      const host = u.hostname.toLowerCase();
      const portSuffix = u.port ? `:${u.port}` : '';

      if (host.startsWith('www.')) {
        const apex = host.slice(4);
        if (apex) out.add(`${proto}//${apex}${portSuffix}`);
        continue;
      }

      const labels = host.split('.').filter(Boolean);
      if (labels.length === 2) {
        out.add(`${proto}//www.${host}${portSuffix}`);
      }
    } catch {
      /* ignore invalid URL entries */
    }
  }
  return [...out];
}

const allowedOrigins = expandAllowedOrigins(
  process.env.FRONTEND_URL
    ? process.env.FRONTEND_URL.split(',').map((url) => url.trim())
    : ['http://localhost:8080'],
);

if (isProdEnv && process.env.FRONTEND_URL) {
  console.log(`🌐 CORS 允许来源（含 www/裸域自动补齐）: ${allowedOrigins.join(', ')}`);
}

app.use(cors({
  origin: (origin, callback) => {
    // 开发环境：允许所有 localhost 和无 origin 的请求
    if (!isProdEnv) {
      if (!origin || origin.includes('localhost') || origin.includes('127.0.0.1')) {
        return callback(null, true);
      }
    }

    // 生产环境或非 localhost：检查白名单
    if (!origin) return callback(null, true); // 允许无 origin（Postman、curl）

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(morgan('dev'));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

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

      // 从环境变量读取白名单（逗号分隔）
      const whitelist = (process.env.RATE_LIMIT_WHITELIST || '').split(',').map(u => u.trim()).filter(Boolean);
      return whitelist.includes(decoded.username);
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
app.use(errorLogger);
app.use(errorHandler);

// 启动服务器
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📝 API docs: http://localhost:${PORT}/api`);
  const aiOk = process.env.AI_API_BASE && process.env.AI_API_KEY && process.env.AI_CHAT_MODEL;
  console.log(
    aiOk
      ? '🤖 AI 答疑：已检测到 AI_API_BASE / KEY / MODEL'
      : `⚠️  AI 答疑未配置（请检查 ${envPath} 是否存在且含 AI_* 变量，改完后需重启本进程）`,
  );
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
