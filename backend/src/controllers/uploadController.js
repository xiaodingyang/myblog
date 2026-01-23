const path = require('path');

/**
 * 上传文件
 */
exports.uploadFile = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        code: 400,
        message: '请选择要上传的文件',
        data: null,
      });
    }

    // 构建文件 URL
    const uploadDir = process.env.UPLOAD_DIR || 'uploads';
    const dateDir = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const url = `/${uploadDir}/${dateDir}/${req.file.filename}`;

    res.json({
      code: 0,
      message: '上传成功',
      data: {
        url,
        filename: req.file.filename,
        originalname: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype,
      },
    });
  } catch (error) {
    next(error);
  }
};
