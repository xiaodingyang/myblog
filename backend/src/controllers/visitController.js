const { Visit } = require('../models');
const { getDateRange, getRecentDates, bjDateToUTC } = require('../utils/dateHelper');
const { maskIP } = require('../utils/ipHelper');

/**
 * 从 referer URL 提取域名
 */
function extractDomain(referer) {
  if (!referer) return null;
  try {
    return new URL(referer).hostname.replace(/^www\./, '');
  } catch {
    return null;
  }
}

const VALID_RANGES = ['today', 'yesterday', 'week', 'month'];

// ==================== 控制器 ====================

/**
 * 记录访问 — POST /api/stats/visit
 * 无需登录，静默失败（存储失败也返回成功）
 */
exports.recordVisit = async (req, res) => {
  try {
    const path = req.body.path || req.body.url;
    const { sessionId } = req.body;

    if (!path || !sessionId) {
      return res.json({ code: 0, message: '记录成功' });
    }

    const rawIP = req.headers['x-forwarded-for']?.split(',')[0]?.trim()
      || req.headers['x-real-ip']
      || req.connection?.remoteAddress
      || '';

    await Visit.create({
      path,
      title: req.body.title || '',
      referer: req.body.referer || req.body.referrer || '',
      userAgent: req.headers['user-agent'] || '',
      ip: maskIP(rawIP),
      sessionId,
      duration: req.body.duration || null,
    });
  } catch {
    // 静默失败，不影响前端
  }
  res.json({ code: 0, message: '记录成功' });
};

/**
 * 获取统计概览 — GET /api/stats/overview?range=today
 */
exports.getOverview = async (req, res, next) => {
  try {
    const range = VALID_RANGES.includes(req.query.range) ? req.query.range : 'today';
    const { startDate, endDate } = getDateRange(range);
    const match = { createdAt: { $gte: startDate, $lt: endDate } };

    const [pv, uvSet, avgResult] = await Promise.all([
      Visit.countDocuments(match),
      Visit.distinct('sessionId', match),
      Visit.aggregate([
        { $match: { ...match, duration: { $ne: null, $gt: 0 } } },
        { $group: { _id: null, avg: { $avg: '$duration' } } },
      ]),
    ]);

    res.json({
      code: 0,
      message: 'ok',
      data: {
        pv,
        uv: uvSet.length,
        avgDuration: avgResult[0]?.avg ? Math.round(avgResult[0].avg) : 0,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * 获取热门页面 — GET /api/stats/top-pages?limit=10&range=today
 */
exports.getTopPages = async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 10, 100);
    const range = VALID_RANGES.includes(req.query.range) ? req.query.range : 'today';
    const { startDate, endDate } = getDateRange(range);

    const list = await Visit.aggregate([
      { $match: { createdAt: { $gte: startDate, $lt: endDate } } },
      {
        $group: {
          _id: '$path',
          title: { $first: '$title' },
          pv: { $sum: 1 },
          sessions: { $addToSet: '$sessionId' },
        },
      },
      {
        $project: {
          _id: 0,
          path: '$_id',
          title: 1,
          pv: 1,
          uv: { $size: '$sessions' },
        },
      },
      { $sort: { pv: -1 } },
      { $limit: limit },
    ]);

    res.json({ code: 0, message: 'ok', data: list });
  } catch (err) {
    next(err);
  }
};

/**
 * 获取访问趋势 — GET /api/stats/trend?days=7
 */
exports.getTrend = async (req, res, next) => {
  try {
    const days = [7, 30].includes(parseInt(req.query.days, 10))
      ? parseInt(req.query.days, 10) : 7;
    const dates = getRecentDates(days);

    // dates[0] 的北京时间 00:00 对应的 UTC 时间
    const startUTC = bjDateToUTC(dates[0]);

    const rows = await Visit.aggregate([
      { $match: { createdAt: { $gte: startUTC } } },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$createdAt',
              timezone: 'Asia/Shanghai',
            },
          },
          pv: { $sum: 1 },
          sessions: { $addToSet: '$sessionId' },
        },
      },
      {
        $project: {
          _id: 0,
          date: '$_id',
          pv: 1,
          uv: { $size: '$sessions' },
        },
      },
    ]);

    const pvMap = Object.fromEntries(rows.map(r => [r.date, r.pv]));
    const uvMap = Object.fromEntries(rows.map(r => [r.date, r.uv]));

    res.json({
      code: 0,
      message: 'ok',
      data: {
        dates,
        pv: dates.map(d => pvMap[d] || 0),
        uv: dates.map(d => uvMap[d] || 0),
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * 获取访客来源分布 — GET /api/stats/referers?limit=5&range=today
 */
exports.getReferers = async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 5, 20);
    const range = VALID_RANGES.includes(req.query.range) ? req.query.range : 'today';
    const { startDate, endDate } = getDateRange(range);

    const rows = await Visit.aggregate([
      { $match: { createdAt: { $gte: startDate, $lt: endDate } } },
      { $project: { referer: { $ifNull: ['$referer', ''] } } },
      { $group: { _id: '$referer', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // 提取域名并归类
    const sourceMap = {};
    let directCount = 0;

    rows.forEach(({ _id, count }) => {
      const domain = extractDomain(_id);
      if (!domain) {
        directCount += count;
      } else {
        sourceMap[domain] = (sourceMap[domain] || 0) + count;
      }
    });

    const sorted = Object.entries(sourceMap).sort((a, b) => b[1] - a[1]);
    const top = sorted.slice(0, limit).map(([source, count]) => ({ source, count }));
    const otherCount = sorted.slice(limit).reduce((sum, [, c]) => sum + c, 0);

    const data = [];
    if (directCount > 0) data.push({ source: '直接访问', count: directCount });
    data.push(...top);
    if (otherCount > 0) data.push({ source: '其他', count: otherCount });

    res.json({ code: 0, message: 'ok', data });
  } catch (err) {
    next(err);
  }
};

/**
 * 获取访问记录列表 — GET /api/stats/visits?page=1&pageSize=20&path=/blog&startDate=...&endDate=...
 */
exports.getVisits = async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const pageSize = Math.min(Math.max(parseInt(req.query.pageSize, 10) || 20, 1), 100);
    const { path, startDate: sd, endDate: ed } = req.query;

    const query = {};
    if (path) query.path = { $regex: path, $options: 'i' };
    if (sd || ed) {
      query.createdAt = {};
      if (sd) query.createdAt.$gte = new Date(sd);
      if (ed) {
        const end = new Date(ed);
        end.setDate(end.getDate() + 1);
        query.createdAt.$lt = end;
      }
    }

    const [total, data] = await Promise.all([
      Visit.countDocuments(query),
      Visit.find(query, { path: 1, title: 1, ip: 1, referer: 1, createdAt: 1 })
        .sort({ createdAt: -1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .lean(),
    ]);

    res.json({
      code: 0,
      message: 'ok',
      data: {
        total,
        page,
        pageSize,
        data: data.map(v => ({
          _id: v._id,
          path: v.path,
          title: v.title,
          ip: v.ip,
          referer: v.referer,
          timestamp: v.createdAt,
        })),
      },
    });
  } catch (err) {
    next(err);
  }
};
