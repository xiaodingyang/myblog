/**
 * Tag Service
 */
const { Tag, Article } = require('../models');

async function getTags() {
  const tags = await Tag.find().populate('articleCount');
  // 按照文章数量降序排序
  return tags.sort((a, b) => (b.articleCount || 0) - (a.articleCount || 0));
}

async function getTag(id) {
  return Tag.findById(id).populate('articleCount');
}

async function createTag({ name }) {
  const existing = await Tag.findOne({ name });
  if (existing) {
    const err = new Error('标签名称已存在');
    err.code = 400;
    err.errorCode = 'TAG_NAME_EXISTS';
    throw err;
  }
  return Tag.create({ name });
}

async function updateTag(id, { name }) {
  if (name) {
    const existing = await Tag.findOne({ name, _id: { $ne: id } });
    if (existing) {
      const err = new Error('标签名称已存在');
      err.code = 400;
      err.errorCode = 'TAG_NAME_EXISTS';
      throw err;
    }
  }
  return Tag.findByIdAndUpdate(id, { name }, { new: true, runValidators: true });
}

async function deleteTag(id) {
  // 从所有文章中移除此标签
  await Article.updateMany({ tags: id }, { $pull: { tags: id } });
  return Tag.findByIdAndDelete(id);
}

module.exports = { getTags, getTag, createTag, updateTag, deleteTag };
