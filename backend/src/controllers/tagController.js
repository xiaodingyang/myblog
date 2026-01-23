const { Tag, Article } = require('../models');

/**
 * 获取标签列表
 */
exports.getTags = async (req, res, next) => {
  try {
    const tags = await Tag.find()
      .populate('articleCount')
      .sort({ createdAt: -1 });

    res.json({
      code: 0,
      message: 'success',
      data: tags,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 获取标签详情
 */
exports.getTag = async (req, res, next) => {
  try {
    const { id } = req.params;

    const tag = await Tag.findById(id).populate('articleCount');

    if (!tag) {
      return res.status(404).json({
        code: 404,
        message: '标签不存在',
        data: null,
      });
    }

    res.json({
      code: 0,
      message: 'success',
      data: tag,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 创建标签
 */
exports.createTag = async (req, res, next) => {
  try {
    const { name } = req.body;

    // 检查标签是否已存在
    const existingTag = await Tag.findOne({ name });
    if (existingTag) {
      return res.status(400).json({
        code: 400,
        message: '标签名称已存在',
        data: null,
      });
    }

    const tag = await Tag.create({ name });

    res.status(201).json({
      code: 0,
      message: '创建成功',
      data: tag,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 更新标签
 */
exports.updateTag = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    // 检查标签名称是否与其他标签冲突
    if (name) {
      const existingTag = await Tag.findOne({
        name,
        _id: { $ne: id },
      });
      if (existingTag) {
        return res.status(400).json({
          code: 400,
          message: '标签名称已存在',
          data: null,
        });
      }
    }

    const tag = await Tag.findByIdAndUpdate(
      id,
      { name },
      { new: true, runValidators: true }
    );

    if (!tag) {
      return res.status(404).json({
        code: 404,
        message: '标签不存在',
        data: null,
      });
    }

    res.json({
      code: 0,
      message: '更新成功',
      data: tag,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 删除标签
 */
exports.deleteTag = async (req, res, next) => {
  try {
    const { id } = req.params;

    // 从所有文章中移除此标签
    await Article.updateMany(
      { tags: id },
      { $pull: { tags: id } }
    );

    const tag = await Tag.findByIdAndDelete(id);

    if (!tag) {
      return res.status(404).json({
        code: 404,
        message: '标签不存在',
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
