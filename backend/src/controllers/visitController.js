/**
 * Visit Controller
 */
const visitService = require('../services/visitService');

exports.recordVisit = async (req, res) => {
  try {
    const path = req.body.path || req.body.url;
    const { sessionId } = req.body;
    if (path && sessionId) {
      const rawIP = req.headers['x-forwarded-for']?.split(',')[0]?.trim()
        || req.headers['x-real-ip']
        || req.connection?.remoteAddress
        || '';
      await visitService.recordVisit({
        path,
        title: req.body.title,
        referer: req.body.referer || req.body.referrer,
        userAgent: req.headers['user-agent'],
        sessionId,
        duration: req.body.duration,
        rawIP,
      });
    }
  } catch {
    // 静默失败
  }
  return res.json({ code: 0, message: '记录成功' });
};

exports.getOverview = async (req, res, next) => {
  try {
    const data = await visitService.getOverview(req.query.range);
    return res.json({ code: 0, message: 'ok', data });
  } catch (err) {
    next(err);
  }
};

exports.getTopPages = async (req, res, next) => {
  try {
    const { limit, range } = req.query;
    const data = await visitService.getTopPages({ limit, range });
    return res.json({ code: 0, message: 'ok', data });
  } catch (err) {
    next(err);
  }
};

exports.getTrend = async (req, res, next) => {
  try {
    const { days } = req.query;
    const data = await visitService.getTrend({ days });
    return res.json({ code: 0, message: 'ok', data });
  } catch (err) {
    next(err);
  }
};

exports.getReferers = async (req, res, next) => {
  try {
    const { limit, range } = req.query;
    const data = await visitService.getReferers({ limit, range });
    return res.json({ code: 0, message: 'ok', data });
  } catch (err) {
    next(err);
  }
};

exports.getVisits = async (req, res, next) => {
  try {
    const { page, pageSize, path, startDate, endDate } = req.query;
    const data = await visitService.getVisits({ page, pageSize, path, startDate, endDate });
    return res.json({ code: 0, message: 'ok', data });
  } catch (err) {
    next(err);
  }
};
