/**
 * Statistics Controller
 */
const statisticsService = require('../services/statisticsService');

exports.getStatistics = async (req, res, next) => {
  try {
    const data = await statisticsService.getStatistics();
    return res.json({ code: 0, message: 'success', data });
  } catch (err) {
    next(err);
  }
};
