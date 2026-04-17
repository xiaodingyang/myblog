/**
 * Article Service
 * 职责：所有文章相关的业务逻辑、数据访问、缓存策略
 * Controller 只负责 HTTP 协议解析，调用此模块完成业务操作
 */
const { Article, Favorite } = require('../models');

// ========== 阅读量防刷 ==========
const viewedMap = new Map(); // key: `${ip}_${articleId}`, value: timestamp
const VIEW_COOLDOWN = 24 * 60 * 60 * 1000; // 24小时

// 每小时清理过期记录
setInterval(() => {
  const now = Date.now();
  for (const [key, timestamp] of viewedMap) {
    if (now - timestamp > VIEW_COOLDOWN) {
      viewedMap.delete(key);
    }
  }
}, 60 * 60 * 1000);

// ========== 文章列表缓存 ==========
const cacheStore = { data: null, key: null, expireAt: 0 };
const CACHE_TTL = 60 * 1000; // 60秒

function clearArticleListCache() {
  cacheStore.data = null;
  cacheStore.key = null;
  cacheStore.expireAt = 0;
}

// ========== 工具函数 ==========
function articlePublicFields(article) {
  if (!article) return article;
  const a = { ...article };
  delete a.likes;
  const likeCount = typeof a.likeCount === 'number' ? a.likeCount : 0;
  return { ...a, likeCount };
}

// ========== Service 方法 ==========

/**
 * 获取文章列表（前台）
 */
async function getArticles({ page = 1, pageSize = 10, keyword, category, tag, sort = 'latest' } = {}) {
  const query = { status: 'published' };

  if (keyword) {
    query.$or = [
      { title: { $regex: keyword, $options: 'i' } },
      { content: { $regex: keyword, $options: 'i' } },
    ];
  }
  if (category) query.category = category;
  if (tag) query.tags = tag;

  const sortOptions = {
    latest: { createdAt: -1 },
    oldest: { createdAt: 1 },
    hottest: { views: -1, createdAt: -1 },
  };
  const sortOrder = sortOptions[sort] || sortOptions.latest;

  const skip = (parseInt(page) - 1) * parseInt(pageSize);
  const [articles, total] = await Promise.all([
    Article.find(query)
      .select('-content -likes')
      .populate('category', 'name')
      .populate('tags', 'name')
      .populate('author', 'username avatar')
      .sort(sortOrder)
      .skip(skip)
      .limit(parseInt(pageSize))
      .lean(),
    Article.countDocuments(query),
  ]);

  const list = articles.map(a => articlePublicFields(a));
  return { list, total, page: parseInt(page), pageSize: parseInt(pageSize) };
}

/**
 * 获取带缓存的文章列表
 */
async function getArticlesWithCache({ page, pageSize, keyword, category, tag, sort }) {
  const cacheKey = JSON.stringify({ keyword, category, tag, page, pageSize, sort });
  if (cacheStore.key === cacheKey && cacheStore.data && Date.now() < cacheStore.expireAt) {
    return { data: cacheStore.data, fromCache: true };
  }
  const result = await getArticles({ page, pageSize, keyword, category, tag, sort });
  cacheStore.key = cacheKey;
  cacheStore.data = result;
  cacheStore.expireAt = Date.now() + CACHE_TTL;
  return { data: result, fromCache: false };
}

/**
 * 获取文章归档
 */
async function getArchives({ limit = 100 } = {}) {
  if (global._archivesCache && Date.now() - global._archivesCacheTime < 5 * 60 * 1000) {
    return global._archivesCache;
  }

  const articles = await Article.find({ status: 'published' })
    .select('title createdAt category')
    .populate('category', 'name')
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .lean();

  const yearMap = {};
  articles.forEach(article => {
    const date = new Date(article.createdAt);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const key = `${year}-${String(month).padStart(2, '0')}`;
    if (!yearMap[key]) yearMap[key] = { year, month, articles: [] };
    yearMap[key].articles.push({
      id: article._id,
      title: article.title,
      createdAt: article.createdAt,
      category: article.category?.name || '未分类',
    });
  });

  const grouped = Object.values(yearMap).sort((a, b) => {
    if (b.year !== a.year) return b.year - a.year;
    return b.month - a.month;
  });

  global._archivesCache = grouped;
  global._archivesCacheTime = Date.now();
  return grouped;
}

/**
 * 获取文章详情
 */
async function getArticle(id, { githubUserId } = {}) {
  const article = await Article.findOne({ _id: id, status: 'published' })
    .populate('category', 'name description')
    .populate('tags', 'name')
    .populate('author', 'username avatar')
    .lean();

  if (!article) return null;

  const likeIds = (article.likes || []).map(x => x.toString());
  const liked = githubUserId ? likeIds.includes(githubUserId.toString()) : false;
  let favorited = false;
  if (githubUserId) {
    favorited = !!(await Favorite.exists({ user: githubUserId, article: article._id }));
  }

  const likeCount = typeof article.likeCount === 'number' ? article.likeCount : likeIds.length;
  const data = articlePublicFields(article);
  data.likeCount = likeCount;
  data.liked = liked;
  data.favorited = favorited;
  data.viewCount = typeof article.viewCount === 'number' ? article.viewCount : 0;

  return data;
}

/**
 * 记录文章阅读（防刷）
 */
function recordView(id, ip) {
  const viewKey = `${ip}_${id}`;
  const lastViewed = viewedMap.get(viewKey);
  if (!lastViewed || Date.now() - lastViewed > VIEW_COOLDOWN) {
    viewedMap.set(viewKey, Date.now());
    Article.findByIdAndUpdate(id, { $inc: { views: 1, viewCount: 1 } }).exec();
    return true;
  }
  return false;
}

/**
 * 文章点赞/取消点赞
 */
async function toggleLike(id, userId) {
  const article = await Article.findOne({ _id: id, status: 'published' }).select('likes likeCount');
  if (!article) return null;

  const already = (article.likes || []).some(x => x.equals(userId));
  if (already) {
    await Article.updateOne({ _id: id }, { $pull: { likes: userId }, $inc: { likeCount: -1 } });
    await Article.updateOne({ _id: id, likeCount: { $lt: 0 } }, { $set: { likeCount: 0 } });
  } else {
    await Article.updateOne({ _id: id }, { $addToSet: { likes: userId }, $inc: { likeCount: 1 } });
  }

  const updated = await Article.findById(id).select('likes likeCount').lean();
  const liked = (updated.likes || []).some(x => x.equals(userId));
  const likeCount = Math.max(0, updated.likeCount ?? 0);

  return { likeCount, liked };
}

/**
 * 获取文章列表（后台）
 */
async function getAdminArticles({ page = 1, pageSize = 10, keyword, status, category, tags } = {}) {
  const query = {};
  if (keyword) query.title = { $regex: keyword, $options: 'i' };
  if (status) query.status = status;
  if (category) query.category = category;

  if (tags) {
    const raw = Array.isArray(tags) ? tags : String(tags).split(',');
    const tagIds = raw.map(t => String(t).trim()).filter(id => mongoose.Types.ObjectId.isValid(id));
    if (tagIds.length === 1) query.tags = tagIds[0];
    else if (tagIds.length > 1) query.tags = { $all: tagIds };
  }

  const skip = (parseInt(page) - 1) * parseInt(pageSize);
  const [articles, total] = await Promise.all([
    Article.find(query)
      .populate('category', 'name')
      .populate('tags', 'name')
      .populate('author', 'username avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(pageSize)),
    Article.countDocuments(query),
  ]);

  return { list: articles, total, page: parseInt(page), pageSize: parseInt(pageSize) };
}

/**
 * 获取文章详情（后台）
 */
async function getAdminArticle(id) {
  return Article.findById(id)
    .populate('category', 'name')
    .populate('tags', 'name')
    .populate('author', 'username avatar');
}

/**
 * 创建文章
 */
async function createArticle({ title, content, summary, cover, category, tags, status, authorId }) {
  const article = await Article.create({
    title, content, summary, cover, category, tags: tags || [], status: status || 'draft', author: authorId,
  });
  clearArticleListCache();
  return Article.findById(article._id)
    .populate('category', 'name')
    .populate('tags', 'name')
    .populate('author', 'username avatar');
}

/**
 * 更新文章
 */
async function updateArticle(id, { title, content, summary, cover, category, tags, status }) {
  const article = await Article.findByIdAndUpdate(
    id,
    { title, content, summary, cover, category, tags, status },
    { new: true, runValidators: true }
  )
    .populate('category', 'name')
    .populate('tags', 'name')
    .populate('author', 'username avatar');

  if (article) clearArticleListCache();
  return article;
}

/**
 * 删除文章
 */
async function deleteArticle(id) {
  const article = await Article.findByIdAndDelete(id);
  if (article) clearArticleListCache();
  return article;
}

/**
 * 同分类已发布文章（排除指定篇），供 AI 答疑扩展检索
 * @param {string|import('mongoose').Types.ObjectId} categoryId
 * @param {string|import('mongoose').Types.ObjectId} excludeArticleId
 * @param {number} limit
 */
async function findPublishedInCategoryExcept(categoryId, excludeArticleId, limit = 8) {
  if (categoryId == null || categoryId === '') return [];
  const lim = Math.min(Math.max(parseInt(String(limit), 10) || 8, 1), 30);
  const query = { status: 'published', category: categoryId };
  if (excludeArticleId != null && excludeArticleId !== '') {
    query._id = { $ne: excludeArticleId };
  }
  return Article.find(query).select('title content').sort({ updatedAt: -1 }).limit(lim).lean();
}

module.exports = {
  getArticles,
  getArticlesWithCache,
  getArchives,
  getArticle,
  recordView,
  toggleLike,
  getAdminArticles,
  getAdminArticle,
  createArticle,
  updateArticle,
  deleteArticle,
  clearArticleListCache,
  findPublishedInCategoryExcept,
};
