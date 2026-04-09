/**
 * Category Service
 */
const { Category, Article } = require('../models');

async function getCategories() {
  return Category.find().populate('articleCount').sort({ createdAt: -1 });
}

async function getCategory(id) {
  return Category.findById(id).populate('articleCount');
}

async function createCategory({ name, description }) {
  const existing = await Category.findOne({ name });
  if (existing) {
    const err = new Error('分类名称已存在');
    err.code = 400;
    err.errorCode = 'CATEGORY_NAME_EXISTS';
    throw err;
  }
  return Category.create({ name, description });
}

async function updateCategory(id, { name, description }) {
  if (name) {
    const existing = await Category.findOne({ name, _id: { $ne: id } });
    if (existing) {
      const err = new Error('分类名称已存在');
      err.code = 400;
      err.errorCode = 'CATEGORY_NAME_EXISTS';
      throw err;
    }
  }
  return Category.findByIdAndUpdate(id, { name, description }, { new: true, runValidators: true });
}

async function deleteCategory(id) {
  const articleCount = await Article.countDocuments({ category: id });
  if (articleCount > 0) {
    const err = new Error(`该分类下有 ${articleCount} 篇文章，无法删除`);
    err.code = 400;
    err.errorCode = 'CATEGORY_HAS_ARTICLES';
    throw err;
  }
  return Category.findByIdAndDelete(id);
}

module.exports = { getCategories, getCategory, createCategory, updateCategory, deleteCategory };
