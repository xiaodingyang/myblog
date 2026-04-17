/**
 * 站内 AI 答疑（单篇 / 全站通用）
 */
const mongoose = require('mongoose');
const aiAskService = require('../services/aiAskService');
const { success, error } = require('../utils/response');

const MAX_Q = Math.min(Math.max(parseInt(process.env.AI_MAX_QUESTION_CHARS, 10) || 800, 200), 4000);

exports.askArticle = async (req, res, next) => {
  try {
    const { articleId, question } = req.body || {};
    if (!articleId || !mongoose.Types.ObjectId.isValid(String(articleId))) {
      return error(res, 400, 'PARAM_ERROR', 'articleId 无效');
    }
    if (!question || typeof question !== 'string') {
      return error(res, 400, 'PARAM_ERROR', 'question 不能为空');
    }
    const q = question.trim();
    if (q.length < 2) {
      return error(res, 400, 'PARAM_ERROR', '问题过短');
    }
    if (q.length > MAX_Q) {
      return error(res, 400, 'PARAM_ERROR', `问题长度不能超过 ${MAX_Q} 字`);
    }

    const scope = req.body?.scope === 'article' ? 'article' : 'article_then_category';
    const categoryAssist = req.body?.categoryAssist === true;

    const data = await aiAskService.askArticle({
      articleId: String(articleId),
      question: q,
      scope,
      categoryAssist,
    });
    return success(res, data);
  } catch (err) {
    next(err);
  }
};

/** 全站通用问答（不绑定文章） */
exports.askGeneral = async (req, res, next) => {
  try {
    const { question } = req.body || {};
    if (!question || typeof question !== 'string') {
      return error(res, 400, 'PARAM_ERROR', 'question 不能为空');
    }
    const q = question.trim();
    if (q.length < 2) {
      return error(res, 400, 'PARAM_ERROR', '问题过短');
    }
    if (q.length > MAX_Q) {
      return error(res, 400, 'PARAM_ERROR', `问题长度不能超过 ${MAX_Q} 字`);
    }
    const data = await aiAskService.askGeneral({ question: q });
    return success(res, data);
  } catch (err) {
    next(err);
  }
};
