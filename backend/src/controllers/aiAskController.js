/**
 * 站内 AI 答疑（单篇 / 全站通用）
 */
const mongoose = require('mongoose');
const aiAskService = require('../services/aiAskService');
const ErrorCode = require('../config/errorCode');
const { success, error, ApiError } = require('../utils/response');

const MAX_Q = Math.min(Math.max(parseInt(process.env.AI_MAX_QUESTION_CHARS, 10) || 800, 200), 4000);

function isKnownApiError(err) {
  if (!err) return false;
  if (err instanceof ApiError) return true;
  return err.name === 'ApiError' && typeof err.statusCode === 'number';
}

function nextAiUnexpected(err, next, label) {
  if (isKnownApiError(err)) return next(err);
  console.error(`[${label}] unexpected`, err);
  return next(
    new ApiError(
      503,
      ErrorCode.AI_UPSTREAM_ERROR,
      'AI 答疑暂时不可用，请稍后重试。若持续出现，请查看服务器日志或联系站长。',
    ),
  );
}

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
    nextAiUnexpected(err, next, 'ai/ask');
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
    nextAiUnexpected(err, next, 'ai/chat');
  }
};
