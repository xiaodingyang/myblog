const { Category, Article } = require('../models');

/**
 * 获取分类列表（前台）
 */
exports.getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find()
      .populate('articleCount')
      .sort({ createdAt: -1 });

    res.json({
      code: 0,
      message: 'success',
      data: categories,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 获取分类详情
 */
exports.getCategory = async (req, res, next) => {
  try {
    const { id } = req.params;

    const category = await Category.findById(id).populate('articleCount');

    if (!category) {
      return res.status(404).json({
        code: 404,
        message: '分类不存在',
        data: null,
      });
    }

    res.json({
      code: 0,
      message: 'success',
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 创建分类
 */
exports.createCategory = async (req, res, next) => {
  try {
    const { name, description } = req.body;

    // 检查分类是否已存在
    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      return res.status(400).json({
        code: 400,
        message: '分类名称已存在',
        data: null,
      });
    }

    const category = await Category.create({ name, description });

    res.status(201).json({
      code: 0,
      message: '创建成功',
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 更新分类
 */
exports.updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    // 检查分类名称是否与其他分类冲突
    if (name) {
      const existingCategory = await Category.findOne({
        name,
        _id: { $ne: id },
      });
      if (existingCategory) {
        return res.status(400).json({
          code: 400,
          message: '分类名称已存在',
          data: null,
        });
      }
    }

    const category = await Category.findByIdAndUpdate(
      id,
      { name, description },
      { new: true, runValidators: true }
    );

    if (!category) {
      return res.status(404).json({
        code: 404,
        message: '分类不存在',
        data: null,
      });
    }

    res.json({
      code: 0,
      message: '更新成功',
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 删除分类
 */
exports.deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;

    // 检查是否有文章使用此分类
    const articleCount = await Article.countDocuments({ category: id });
    if (articleCount > 0) {
      return res.status(400).json({
        code: 400,
        message: `该分类下有 ${articleCount} 篇文章，无法删除`,
        data: null,
      });
    }

    const category = await Category.findByIdAndDelete(id);

    if (!category) {
      return res.status(404).json({
        code: 404,
        message: '分类不存在',
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
