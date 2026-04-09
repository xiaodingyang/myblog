/**
 * Upload Service
 */
const path = require('path');

let sharp;
try {
  sharp = require('sharp');
} catch {
  // sharp not installed
}

async function processUpload(file) {
  const uploadDir = process.env.UPLOAD_DIR || 'uploads';
  const dateDir = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const url = `/${uploadDir}/${dateDir}/${file.filename}`;
  const filePath = file.path;

  const result = {
    url,
    filename: file.filename,
    originalname: file.originalname,
    size: file.size,
    mimetype: file.mimetype,
  };

  if (sharp && /\.(jpe?g|png|gif)$/i.test(file.filename)) {
    try {
      const ext = path.extname(file.filename);
      const baseName = file.filename.replace(ext, '');

      const webpFilename = `${baseName}.webp`;
      const webpPath = path.join(path.dirname(filePath), webpFilename);
      await sharp(filePath).webp({ quality: 80 }).toFile(webpPath);
      result.webpUrl = `/${uploadDir}/${dateDir}/${webpFilename}`;

      const thumbFilename = `${baseName}_thumb${ext}`;
      const thumbPath = path.join(path.dirname(filePath), thumbFilename);
      await sharp(filePath).resize(400).toFile(thumbPath);
      result.thumbUrl = `/${uploadDir}/${dateDir}/${thumbFilename}`;

      const thumbWebpFilename = `${baseName}_thumb.webp`;
      const thumbWebpPath = path.join(path.dirname(filePath), thumbWebpFilename);
      await sharp(filePath).resize(400).webp({ quality: 80 }).toFile(thumbWebpPath);
      result.thumbWebpUrl = `/${uploadDir}/${dateDir}/${thumbWebpFilename}`;
    } catch (imgErr) {
      console.error('Image processing error:', imgErr);
    }
  }

  return result;
}

module.exports = { processUpload };
