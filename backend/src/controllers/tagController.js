/**
 * Tag Controller
 */
const tagService = require('../services/tagService');
const { success, error } = require('../utils/response');

exports.getTags = async (req, res, next) => {
  try {
    const tags = await tagService.getTags();
    return res.json({ code: 0, message: 'success', data: tags });
  } catch (err) {
    next(err);
  }
};

exports.getTag = async (req, res, next) => {
  try {
    const { id } = req.params;
    const tag = await tagService.getTag(id);
    if (!tag) return error(res, 404, 'TAG_NOT_FOUND', '标签不存在');
    return res.json({ code: 0, message: 'success', data: tag });
  } catch (err) {
    next(err);
  }
};

exports.createTag = async (req, res, next) => {
  try {
    const { name } = req.body;
    const tag = await tagService.createTag({ name });
    return res.status(201).json({ code: 0, message: '创建成功', data: tag });
  } catch (err) {
    if (err.code === 400) return error(res, err.code, err.errorCode, err.message);
    next(err);
  }
};

exports.updateTag = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const tag = await tagService.updateTag(id, { name });
    if (!tag) return error(res, 404, 'TAG_NOT_FOUND', '标签不存在');
    return success(res, tag, '更新成功');
  } catch (err) {
    if (err.code === 400) return error(res, err.code, err.errorCode, err.message);
    next(err);
  }
};

exports.deleteTag = async (req, res, next) => {
  try {
    const { id } = req.params;
    const tag = await tagService.deleteTag(id);
    if (!tag) return error(res, 404, 'TAG_NOT_FOUND', '标签不存在');
    return success(res, null, '删除成功');
  } catch (err) {
    next(err);
  }
};
