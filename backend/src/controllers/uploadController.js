const path = require('path');

let sharp;
try {
  sharp = require('sharp');
} catch {
  // sharp not installed, skip WebP generation
}

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
    const filePath = req.file.path;

    const result = {
      url,
      filename: req.file.filename,
      originalname: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype,
    };

    // Generate WebP + thumbnail if sharp is available and it's an image
    if (sharp && /\.(jpe?g|png|gif)$/i.test(req.file.filename)) {
      try {
        const ext = path.extname(req.file.filename);
        const baseName = req.file.filename.replace(ext, '');

        // WebP version
        const webpFilename = `${baseName}.webp`;
        const webpPath = path.join(path.dirname(filePath), webpFilename);
        await sharp(filePath).webp({ quality: 80 }).toFile(webpPath);
        result.webpUrl = `/${uploadDir}/${dateDir}/${webpFilename}`;

        // Thumbnail
        const thumbFilename = `${baseName}_thumb${ext}`;
        const thumbPath = path.join(path.dirname(filePath), thumbFilename);
        await sharp(filePath).resize(400).toFile(thumbPath);
        result.thumbUrl = `/${uploadDir}/${dateDir}/${thumbFilename}`;

        // Thumbnail WebP
        const thumbWebpFilename = `${baseName}_thumb.webp`;
        const thumbWebpPath = path.join(path.dirname(filePath), thumbWebpFilename);
        await sharp(filePath).resize(400).webp({ quality: 80 }).toFile(thumbWebpPath);
        result.thumbWebpUrl = `/${uploadDir}/${dateDir}/${thumbWebpFilename}`;
      } catch (imgErr) {
        console.error('Image processing error:', imgErr);
        // Continue without WebP - original upload still valid
      }
    }

    res.json({
      code: 0,
      message: '上传成功',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
