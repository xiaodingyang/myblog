const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
const isoWeek = require('dayjs/plugin/isoWeek');

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isoWeek);

/**
 * 根据北京时间计算日期范围，返回 UTC Date 对象用于 MongoDB 查询
 * @param {string} range - 'today' | 'yesterday' | 'week' | 'month'
 * @returns {{ startDate: Date, endDate: Date }}
 */
function getDateRange(range) {
  const now = dayjs().tz('Asia/Shanghai');
  const todayStart = now.startOf('day');

  let start, end;
  switch (range) {
    case 'yesterday':
      start = todayStart.subtract(1, 'day');
      end = todayStart;
      break;
    case 'week':
      start = todayStart.startOf('isoWeek'); // 周一
      end = todayStart.add(1, 'day');
      break;
    case 'month':
      start = todayStart.startOf('month');
      end = todayStart.add(1, 'day');
      break;
    default: // today
      start = todayStart;
      end = todayStart.add(1, 'day');
  }

  return {
    startDate: start.toDate(),
    endDate: end.toDate(),
  };
}

/**
 * 获取最近 N 天的日期字符串数组（北京时间）
 * @param {number} days - 天数
 * @returns {string[]} ['2026-04-01', '2026-04-02', ...]
 */
function getRecentDates(days) {
  const now = dayjs().tz('Asia/Shanghai');
  const todayStart = now.startOf('day');

  const dates = [];
  for (let i = days - 1; i >= 0; i--) {
    dates.push(todayStart.subtract(i, 'day').format('YYYY-MM-DD'));
  }
  return dates;
}

module.exports = {
  getDateRange,
  getRecentDates,
  /**
   * 将北京时间日期字符串转为 UTC Date（当天 00:00 北京时间）
   * @param {string} dateStr - 'YYYY-MM-DD' 格式的北京时间日期
   * @returns {Date}
   */
  bjDateToUTC(dateStr) {
    return dayjs.tz(dateStr, 'Asia/Shanghai').startOf('day').toDate();
  },
};
