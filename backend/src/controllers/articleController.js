const { Article, Category, Tag } = require('../models');

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
 * 获取文章详情（前台）
 */
exports.getArticle = async (req, res, next) => {
  try {
    const { id } = req.params;

    const article = await Article.findOne({ _id: id, status: 'published' })
      .populate('category', 'name description')
      .populate('tags', 'name')
      .populate('author', 'username avatar');

    if (!article) {
      return res.status(404).json({
        code: 404,
        message: '文章不存在',
        data: null,
      });
    }

    // 增加阅读量
    await Article.findByIdAndUpdate(id, { $inc: { views: 1 } });

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
 * 获取文章列表（后台）
 */
exports.getAdminArticles = async (req, res, next) => {
  try {
    const { page = 1, pageSize = 10, keyword, status, category } = req.query;

    // 构建查询条件
    const query = {};

    if (keyword) {
      query.title = { $regex: keyword, $options: 'i' };
    }

    if (status) {
      query.status = status;
    }

    if (category) {
      query.category = category;
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
