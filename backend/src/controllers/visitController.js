const { Visit } = require('../models');

/**
 * 记录访问
 * POST /api/visits
 */
exports.recordVisit = async (req, res, next) => {
  try {
    const { url, title, referrer, userAgent, sessionId, userId } = req.body;

    // 兼容前端旧版本（发送 path 而非 url）
    const visitUrl = url || req.body.path;

    // 验证必填字段
    if (!visitUrl || !sessionId) {
      return res.status(400).json({
        code: 400,
        message: 'url 和 sessionId 不能为空',
        data: null,
      });
    }

    // 获取访客 IP（从请求头或连接信息中获取）
    const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
                req.headers['x-real-ip'] ||
                req.connection.remoteAddress ||
                req.socket.remoteAddress ||
                '';

    // 创建访问记录
    const visit = await Visit.create({
      url,
      title: title || '',
      referrer: referrer || '',
      userAgent: userAgent || req.headers['user-agent'] || '',
      ip,
      sessionId,
      userId: userId || null,
      timestamp: new Date(),
    });

    res.status(201).json({
      code: 0,
      message: '访问记录成功',
      data: { id: visit._id },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 获取总览统计
 * GET /api/stats/overview
 */
exports.getOverview = async (req, res, next) => {
  try {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterdayStart = new Date(todayStart);
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);

    // 并行查询多个统计数据
    const [
      totalPV,
      totalUV,
      todayPV,
      todayUV,
      yesterdayPV,
      yesterdayUV,
    ] = await Promise.all([
      // 总 PV（总访问量）
      Visit.countDocuments(),
      
      // 总 UV（独立访客数）
      Visit.distinct('sessionId').then(sessions => sessions.length),
      
      // 今日 PV
      Visit.countDocuments({ timestamp: { $gte: todayStart } }),
      
      // 今日 UV
      Visit.distinct('sessionId', { timestamp: { $gte: todayStart } })
        .then(sessions => sessions.length),
      
      // 昨日 PV
      Visit.countDocuments({
        timestamp: { $gte: yesterdayStart, $lt: todayStart },
      }),
      
      // 昨日 UV
      Visit.distinct('sessionId', {
        timestamp: { $gte: yesterdayStart, $lt: todayStart },
      }).then(sessions => sessions.length),
    ]);

    res.json({
      code: 0,
      message: 'success',
      data: {
        total: {
          pv: totalPV,
          uv: totalUV,
        },
        today: {
          pv: todayPV,
          uv: todayUV,
        },
        yesterday: {
          pv: yesterdayPV,
          uv: yesterdayUV,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 获取页面统计（热门页面排行）
 * GET /api/stats/pages
 */
exports.getPageStats = async (req, res, next) => {
  try {
    const { limit = 10, days = 30 } = req.query;
    const limitNum = Math.min(parseInt(limit, 10), 100);
    const daysNum = parseInt(days, 10);

    // 计算时间范围
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysNum);

    // 聚合查询：按 URL 分组统计 PV 和 UV
    const pageStats = await Visit.aggregate([
      // 筛选时间范围
      { $match: { timestamp: { $gte: startDate } } },
      
      // 按 URL 分组
      {
        $group: {
          _id: '$url',
          title: { $first: '$title' },
          pv: { $sum: 1 },
          sessions: { $addToSet: '$sessionId' },
        },
      },
      
      // 计算 UV
      {
        $project: {
          _id: 0,
          url: '$_id',
          title: 1,
          pv: 1,
          uv: { $size: '$sessions' },
        },
      },
      
      // 按 PV 降序排序
      { $sort: { pv: -1 } },
      
      // 限制返回数量
      { $limit: limitNum },
    ]);

    res.json({
      code: 0,
      message: 'success',
      data: {
        list: pageStats,
        days: daysNum,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 获取访问趋势（按日期聚合）
 * GET /api/stats/trend
 */
exports.getTrend = async (req, res, next) => {
  try {
    const { days = 7 } = req.query;
    const daysNum = Math.min(parseInt(days, 10), 90);

    // 计算时间范围
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysNum);
    startDate.setHours(0, 0, 0, 0);

    // 聚合查询：按日期分组统计
    const trendData = await Visit.aggregate([
      // 筛选时间范围
      { $match: { timestamp: { $gte: startDate } } },
      
      // 按日期分组
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$timestamp',
              timezone: 'Asia/Shanghai',
            },
          },
          pv: { $sum: 1 },
          sessions: { $addToSet: '$sessionId' },
        },
      },
      
      // 计算 UV
      {
        $project: {
          _id: 0,
          date: '$_id',
          pv: 1,
          uv: { $size: '$sessions' },
        },
      },
      
      // 按日期升序排序
      { $sort: { date: 1 } },
    ]);

    // 填充缺失的日期（确保每天都有数据，即使是 0）
    const result = [];
    const currentDate = new Date(startDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    while (currentDate <= today) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const found = trendData.find(item => item.date === dateStr);
      
      result.push({
        date: dateStr,
        pv: found ? found.pv : 0,
        uv: found ? found.uv : 0,
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    res.json({
      code: 0,
      message: 'success',
      data: {
        list: result,
        days: daysNum,
      },
    });
  } catch (error) {
    next(error);
  }
};
