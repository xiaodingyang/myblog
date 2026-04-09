/**
 * Category Controller
 */
const categoryService = require('../services/categoryService');
const { success, error } = require('../utils/response');

exports.getCategories = async (req, res, next) => {
  try {
    const categories = await categoryService.getCategories();
    return success(res, categories);
  } catch (err) {
    next(err);
  }
};

exports.getCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const category = await categoryService.getCategory(id);
    if (!category) return error(res, 404, 'CATEGORY_NOT_FOUND', '分类不存在');
    return success(res, category);
  } catch (err) {
    next(err);
  }
};

exports.createCategory = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const category = await categoryService.createCategory({ name, description });
    return res.status(201).json({ code: 0, message: '创建成功', data: category });
  } catch (err) {
    if (err.code === 400) return error(res, err.code, err.errorCode, err.message);
    next(err);
  }
};

exports.updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    const category = await categoryService.updateCategory(id, { name, description });
    if (!category) return error(res, 404, 'CATEGORY_NOT_FOUND', '分类不存在');
    return success(res, category, '更新成功');
  } catch (err) {
    if (err.code === 400) return error(res, err.code, err.errorCode, err.message);
    next(err);
  }
};

exports.deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const category = await categoryService.deleteCategory(id);
    if (!category) return error(res, 404, 'CATEGORY_NOT_FOUND', '分类不存在');
    return success(res, null, '删除成功');
  } catch (err) {
    if (err.code === 400) return error(res, err.code, err.errorCode, err.message);
    next(err);
  }
};
