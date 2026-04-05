const express = require('express');
const router = express.Router();
const { auth, adminAuth } = require('../middlewares/auth');
const { Series, Article } = require('../models');

// GET / — 获取所有系列列表（公开）
router.get('/', async (req, res, next) => {
  try {
    const series = await Series.find().sort({ sortOrder: 1, createdAt: -1 });
    // 附加每个系列的文章数
    const result = await Promise.all(series.map(async s => {
      const count = await Article.countDocuments({ series: s._id, status: 'published' });
      return { ...s.toObject(), articleCount: count };
    }));
    res.json({ code: 0, message: 'success', data: result });
  } catch (error) {
    next(error);
  }
});

// GET /:id — 获取系列详情
router.get('/:id', async (req, res, next) => {
  try {
    const series = await Series.findById(req.params.id);
    if (!series) return res.status(404).json({ code: 404, message: '系列不存在' });
    res.json({ code: 0, message: 'success', data: series });
  } catch (error) {
    next(error);
  }
});

// GET /:id/articles — 获取系列下的文章列表
router.get('/:id/articles', async (req, res, next) => {
  try {
    const articles = await Article.find({ series: req.params.id, status: 'published' })
      .select('title summary cover views seriesOrder createdAt')
      .sort({ seriesOrder: 1, createdAt: 1 });
    res.json({ code: 0, message: 'success', data: articles });
  } catch (error) {
    next(error);
  }
});

// POST / — 创建系列（管理员）
router.post('/', auth, adminAuth, async (req, res, next) => {
  try {
    const { title, description, cover, sortOrder } = req.body;
    const series = await Series.create({ title, description, cover, sortOrder });
    res.status(201).json({ code: 0, message: '创建成功', data: series });
  } catch (error) {
    next(error);
  }
});

// PUT /:id — 更新系列（管理员）
router.put('/:id', auth, adminAuth, async (req, res, next) => {
  try {
    const { title, description, cover, sortOrder } = req.body;
    const series = await Series.findByIdAndUpdate(
      req.params.id,
      { title, description, cover, sortOrder },
      { new: true, runValidators: true },
    );
    if (!series) return res.status(404).json({ code: 404, message: '系列不存在' });
    res.json({ code: 0, message: '更新成功', data: series });
  } catch (error) {
    next(error);
  }
});

// DELETE /:id — 删除系列（管理员）
router.delete('/:id', auth, adminAuth, async (req, res, next) => {
  try {
    const series = await Series.findByIdAndDelete(req.params.id);
    if (!series) return res.status(404).json({ code: 404, message: '系列不存在' });
    // 解除文章关联
    await Article.updateMany({ series: req.params.id }, { $unset: { series: 1 }, seriesOrder: 0 });
    res.json({ code: 0, message: '删除成功' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
