/**
 * Upload Controller
 */
const uploadService = require('../services/uploadService');
const { success, error } = require('../utils/response');

exports.uploadFile = async (req, res, next) => {
  try {
    if (!req.file) {
      return error(res, 400, 'PARAM_ERROR', '请选择要上传的文件');
    }
    const result = await uploadService.processUpload(req.file);
    return res.json({ code: 0, message: '上传成功', data: result });
  } catch (err) {
    next(err);
  }
};
