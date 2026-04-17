const NodeCache = require('node-cache');

/**
 * 全局内存缓存实例
 * - stdTTL: 默认 5 分钟过期
 * - checkperiod: 每 120 秒清理过期键
 */
const cache = new NodeCache({ stdTTL: 300, checkperiod: 120 });

/**
 * 缓存键生成器 — 根据路由 path + query 生成唯一键
 */
function buildCacheKey(req) {
  // 不能用 req.route.path：挂载在子路由上的 GET / 都是 '/'，会与 /api/tags、/api/categories 等撞键
  const pathKey =
    [req.baseUrl, req.path].filter(Boolean).join('') || req.originalUrl || '';
  const qs = Object.keys(req.query).length
    ? JSON.stringify(req.query)
    : '';
  return `api:${req.method}:${pathKey}:${qs}`;
}

/**
 * Express 中间件：缓存 GET 请求的响应
 * @param {number} ttl - 缓存秒数，默认 300（5 分钟）
 */
function cacheMiddleware(ttl = 300) {
  return (req, res, next) => {
    if (req.method !== 'GET') return next();

    const key = buildCacheKey(req);
    const cached = cache.get(key);
    if (cached) {
      return res.json(cached);
    }

    // 拦截 res.json，缓存响应数据
    const originalJson = res.json.bind(res);
    res.json = (data) => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        cache.set(key, data, ttl);
      }
      return originalJson(data);
    };

    next();
  };
}

/**
 * 清除匹配 pattern 的缓存键
 * @param {string|RegExp} pattern - 键匹配模式
 */
function clearCache(pattern) {
  if (typeof pattern === 'string') {
    cache.keys().forEach((key) => {
      if (key.includes(pattern)) cache.del(key);
    });
  } else if (pattern instanceof RegExp) {
    cache.keys().forEach((key) => {
      if (pattern.test(key)) cache.del(key);
    });
  }
}

/**
 * 手动设置缓存
 */
function setCache(key, value, ttl) {
  return cache.set(key, value, ttl);
}

/**
 * 手动获取缓存
 */
function getCache(key) {
  return cache.get(key);
}

module.exports = {
  cache,
  cacheMiddleware,
  clearCache,
  setCache,
  getCache,
  buildCacheKey,
};
