const mongoose = require('mongoose');
const { Article, Category, Tag, Favorite } = require('../models');

function articlePublicFields(article) {
  if (!article) return article;
  const a = { ...article };
  delete a.likes;
  const likeCount = typeof a.likeCount === 'number' ? a.likeCount : 0;
  return { ...a, likeCount };
}

/**
 * 获取文章列表（前台）
 */
exports.getArticles = async (req, res, next) => {
  try {
    const { page = 1, pageSize = 10, keyword, category, tag } = req.query;

    // 构建查询条件
    const query = { status: 'published' };

    if (keyword) {
      query.$or = [
        { title: { $regex: keyword, $options: 'i' } },
        { content: { $regex: keyword, $options: 'i' } },
      ];
    }

    if (category) {
      query.category = category;
    }

    if (tag) {
      query.tags = tag;
    }

    // 分页查询
    const skip = (parseInt(page) - 1) * parseInt(pageSize);
    const [articles, total] = await Promise.all([
      Article.find(query)
        .select('-content -likes')
        .populate('category', 'name')
        .populate('tags', 'name')
        .populate('author', 'username avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(pageSize))
        .lean(),
      Article.countDocuments(query),
    ]);

    const list = articles.map((a) => articlePublicFields(a));

    res.json({
      code: 0,
      message: 'success',
      data: {
        list,
        total,
        page: parseInt(page),
        pageSize: parseInt(pageSize),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 获取文章归档（按年份/月份分组）
 */
exports.getArchives = async (req, res, next) => {
  try {
    const { limit = 100 } = req.query;

    // 简单内存缓存（5分钟）
    if (!global._archivesCache || Date.now() - global._archivesCacheTime > 5 * 60 * 1000) {
      const articles = await Article.find({ status: 'published' })
        .select('title createdAt category')
        .populate('category', 'name')
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .lean();

      // 按年份月份分组
      const yearMap = {};
      articles.forEach(article => {
        const date = new Date(article.createdAt);
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const key = `${year}-${String(month).padStart(2, '0')}`;
        if (!yearMap[key]) {
          yearMap[key] = { year, month, articles: [] };
        }
        yearMap[key].articles.push({
          id: article._id,
          title: article.title,
          createdAt: article.createdAt,
          category: article.category?.name || '未分类',
        });
      });

      // 转换为数组并按时间倒序
      const grouped = Object.values(yearMap).sort((a, b) => {
        if (b.year !== a.year) return b.year - a.year;
        return b.month - a.month;
      });

      global._archivesCache = grouped;
      global._archivesCacheTime = Date.now();
    }

    res.json({
      code: 0,
      message: 'success',
      data: global._archivesCache,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 获取文章详情（前台）
 */
exports.getArticle = async (req, res, next) => {
  try {
    const { id } = req.params;

    const article = await Article.findOne({ _id: id, status: 'published' })
      .populate('category', 'name description')
      .populate('tags', 'name')
      .populate('author', 'username avatar')
      .lean();

    if (!article) {
      return res.status(404).json({
        code: 404,
        message: '文章不存在',
        data: null,
      });
    }

    const ghId = req.githubUserId;
    const likeIds = (article.likes || []).map((x) => x.toString());
    const liked = ghId ? likeIds.includes(ghId.toString()) : false;
    let favorited = false;
    if (ghId) {
      favorited = !!(await Favorite.exists({ user: ghId, article: article._id }));
    }

    const likeCount = typeof article.likeCount === 'number'
      ? article.likeCount
      : likeIds.length;

    const data = articlePublicFields(article);
    data.likeCount = likeCount;
    data.liked = liked;
    data.favorited = favorited;

    // 异步增加阅读量，不阻塞响应
    Article.findByIdAndUpdate(id, { $inc: { views: 1 } }).exec();

    res.json({
      code: 0,
      message: 'success',
      data,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 文章点赞/取消点赞（需 GitHub 登录）
 */
exports.toggleArticleLike = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.githubUserId;

    const article = await Article.findOne({ _id: id, status: 'published' }).select('likes likeCount');
    if (!article) {
      return res.status(404).json({ code: 404, message: '文章不存在', data: null });
    }

    const already = (article.likes || []).some((x) => x.equals(userId));
    if (already) {
      await Article.updateOne(
        { _id: id },
        { $pull: { likes: userId }, $inc: { likeCount: -1 } }
      );
      await Article.updateOne(
        { _id: id, likeCount: { $lt: 0 } },
        { $set: { likeCount: 0 } }
      );
    } else {
      await Article.updateOne(
        { _id: id },
        { $addToSet: { likes: userId }, $inc: { likeCount: 1 } }
      );
    }

    const updated = await Article.findById(id).select('likes likeCount').lean();
    const liked = (updated.likes || []).some((x) => x.equals(userId));
    const likeCount = Math.max(0, updated.likeCount ?? 0);

    res.json({
      code: 0,
      message: 'success',
      data: { likeCount, liked },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 获取文章列表（后台）
 */
exports.getAdminArticles = async (req, res, next) => {
  try {
    const { page = 1, pageSize = 10, keyword, status, category, tags } = req.query;

    // 构建查询条件
    const query = {};

    if (keyword) {
      query.title = { $regex: keyword, $options: 'i' };
    }

    if (status) {
      query.status = status;
    }

    if (category && mongoose.Types.ObjectId.isValid(category)) {
      query.category = category;
    }

    if (tags) {
      const raw = Array.isArray(tags) ? tags : String(tags).split(',');
      const tagIds = raw.map((t) => String(t).trim()).filter((id) => mongoose.Types.ObjectId.isValid(id));
      if (tagIds.length === 1) {
        query.tags = tagIds[0];
      } else if (tagIds.length > 1) {
        query.tags = { $all: tagIds };
      }
    }

    // 分页查询
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

    res.json({
      code: 0,
      message: 'success',
      data: {
        list: articles,
        total,
        page: parseInt(page),
        pageSize: parseInt(pageSize),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 获取文章详情（后台）
 */
exports.getAdminArticle = async (req, res, next) => {
  try {
    const { id } = req.params;

    const article = await Article.findById(id)
      .populate('category', 'name')
      .populate('tags', 'name')
      .populate('author', 'username avatar');

    if (!article) {
      return res.status(404).json({
        code: 404,
        message: '文章不存在',
        data: null,
      });
    }

    res.json({
      code: 0,
      message: 'success',
      data: article,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 创建文章
 */
exports.createArticle = async (req, res, next) => {
  try {
    const { title, content, summary, cover, category, tags, status } = req.body;

    const article = await Article.create({
      title,
      content,
      summary,
      cover,
      category,
      tags: tags || [],
      status: status || 'draft',
      author: req.userId,
    });

    // 返回完整的文章信息
    const populatedArticle = await Article.findById(article._id)
      .populate('category', 'name')
      .populate('tags', 'name')
      .populate('author', 'username avatar');

    res.status(201).json({
      code: 0,
      message: '创建成功',
      data: populatedArticle,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 更新文章
 */
exports.updateArticle = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, content, summary, cover, category, tags, status } = req.body;

    const article = await Article.findByIdAndUpdate(
      id,
      { title, content, summary, cover, category, tags, status },
      { new: true, runValidators: true }
    )
      .populate('category', 'name')
      .populate('tags', 'name')
      .populate('author', 'username avatar');

    if (!article) {
      return res.status(404).json({
        code: 404,
        message: '文章不存在',
        data: null,
      });
    }

    res.json({
      code: 0,
      message: '更新成功',
      data: article,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 删除文章
 */
exports.deleteArticle = async (req, res, next) => {
  try {
    const { id } = req.params;

    const article = await Article.findByIdAndDelete(id);

    if (!article) {
      return res.status(404).json({
        code: 404,
        message: '文章不存在',
        data: null,
      });
    }

    res.json({
      code: 0,
      message: '删除成功',
      data: null,
    });
  } catch (error) {
    next(error);
  }
};
