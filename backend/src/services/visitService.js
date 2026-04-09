/**
 * Visit Service
 */
const { Visit } = require('../models');
const { getDateRange, getRecentDates, bjDateToUTC } = require('../utils/dateHelper');
const { maskIP } = require('../utils/ipHelper');

function extractDomain(referer) {
  if (!referer) return null;
  try {
    return new URL(referer).hostname.replace(/^www\./, '');
  } catch {
    return null;
  }
}

const VALID_RANGES = ['today', 'yesterday', 'week', 'month'];

async function recordVisit({ path, title, referer, userAgent, sessionId, duration, rawIP }) {
  await Visit.create({
    path,
    title: title || '',
    referer: referer || '',
    userAgent: userAgent || '',
    ip: maskIP(rawIP),
    sessionId,
    duration: duration || null,
  });
}

async function getOverview(range = 'today') {
  if (!VALID_RANGES.includes(range)) range = 'today';
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

  return {
    pv,
    uv: uvSet.length,
    avgDuration: avgResult[0]?.avg ? Math.round(avgResult[0].avg) : 0,
  };
}

async function getTopPages({ limit = 10, range = 'today' } = {}) {
  limit = Math.min(parseInt(limit, 10) || 10, 100);
  if (!VALID_RANGES.includes(range)) range = 'today';
  const { startDate, endDate } = getDateRange(range);

  return Visit.aggregate([
    { $match: { createdAt: { $gte: startDate, $lt: endDate } } },
    { $group: { _id: '$path', title: { $first: '$title' }, pv: { $sum: 1 }, sessions: { $addToSet: '$sessionId' } } },
    { $project: { _id: 0, path: '$_id', title: 1, pv: 1, uv: { $size: '$sessions' } } },
    { $sort: { pv: -1 } },
    { $limit: limit },
  ]);
}

async function getTrend({ days = 7 } = {}) {
  days = [7, 30].includes(parseInt(days, 10)) ? parseInt(days, 10) : 7;
  const dates = getRecentDates(days);
  const startUTC = bjDateToUTC(dates[0]);

  const rows = await Visit.aggregate([
    { $match: { createdAt: { $gte: startUTC } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt', timezone: 'Asia/Shanghai' } },
        pv: { $sum: 1 },
        sessions: { $addToSet: '$sessionId' },
      },
    },
    { $project: { _id: 0, date: '$_id', pv: 1, uv: { $size: '$sessions' } } },
  ]);

  const pvMap = Object.fromEntries(rows.map(r => [r.date, r.pv]));
  const uvMap = Object.fromEntries(rows.map(r => [r.date, r.uv]));

  return { dates, pv: dates.map(d => pvMap[d] || 0), uv: dates.map(d => uvMap[d] || 0) };
}

async function getReferers({ limit = 5, range = 'today' } = {}) {
  limit = Math.min(parseInt(limit, 10) || 5, 20);
  if (!VALID_RANGES.includes(range)) range = 'today';
  const { startDate, endDate } = getDateRange(range);

  const rows = await Visit.aggregate([
    { $match: { createdAt: { $gte: startDate, $lt: endDate } } },
    { $project: { referer: { $ifNull: ['$referer', ''] } } },
    { $group: { _id: '$referer', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);

  const sourceMap = {};
  let directCount = 0;
  rows.forEach(({ _id, count }) => {
    const domain = extractDomain(_id);
    if (!domain) directCount += count;
    else sourceMap[domain] = (sourceMap[domain] || 0) + count;
  });

  const sorted = Object.entries(sourceMap).sort((a, b) => b[1] - a[1]);
  const top = sorted.slice(0, limit).map(([source, count]) => ({ source, count }));
  const otherCount = sorted.slice(limit).reduce((sum, [, c]) => sum + c, 0);

  const data = [];
  if (directCount > 0) data.push({ source: '直接访问', count: directCount });
  data.push(...top);
  if (otherCount > 0) data.push({ source: '其他', count: otherCount });
  return data;
}

async function getVisits({ page = 1, pageSize = 20, path, startDate: sd, endDate: ed } = {}) {
  page = Math.max(parseInt(page, 10) || 1, 1);
  pageSize = Math.min(Math.max(parseInt(pageSize, 10) || 20, 1), 100);

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

  return {
    total,
    page,
    pageSize,
    data: data.map(v => ({ _id: v._id, path: v.path, title: v.title, ip: v.ip, referer: v.referer, timestamp: v.createdAt })),
  };
}

module.exports = { recordVisit, getOverview, getTopPages, getTrend, getReferers, getVisits };
