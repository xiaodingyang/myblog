const { getDateRange, getRecentDates, bjDateToUTC } = require('../src/utils/dateHelper');

describe('dateHelper', () => {
  describe('getDateRange', () => {
    test('today 返回今天北京时间的起止范围', () => {
      const { startDate, endDate } = getDateRange('today');
      expect(startDate instanceof Date).toBe(true);
      expect(endDate instanceof Date).toBe(true);
      expect(endDate > startDate).toBe(true);
      // 范围应该约 1 天
      const diffHours = (endDate - startDate) / 3600000;
      expect(diffHours).toBeCloseTo(24, 0);
    });

    test('yesterday 返回昨天北京时间的范围', () => {
      const today = getDateRange('today');
      const yesterday = getDateRange('yesterday');
      expect(yesterday.endDate.getTime()).toBe(today.startDate.getTime());
    });

    test('week 起始是周一', () => {
      const { startDate } = getDateRange('week');
      // 转为北京时间查看星期
      const dayjs = require('dayjs');
      require('dayjs/plugin/utc');
      require('dayjs/plugin/timezone');
      const utcPlugin = require('dayjs/plugin/utc');
      const tzPlugin = require('dayjs/plugin/timezone');
      dayjs.extend(utcPlugin);
      dayjs.extend(tzPlugin);
      const bjDay = dayjs(startDate).tz('Asia/Shanghai');
      // 周一 = 1
      expect(bjDay.day()).toBe(1);
    });

    test('month 起始是 1 号', () => {
      const { startDate } = getDateRange('month');
      const dayjs = require('dayjs');
      require('dayjs/plugin/utc');
      require('dayjs/plugin/timezone');
      const utcPlugin = require('dayjs/plugin/utc');
      const tzPlugin = require('dayjs/plugin/timezone');
      dayjs.extend(utcPlugin);
      dayjs.extend(tzPlugin);
      const bjDay = dayjs(startDate).tz('Asia/Shanghai');
      expect(bjDay.date()).toBe(1);
    });

    test('无效 range 默认为 today', () => {
      const result = getDateRange('invalid');
      const today = getDateRange('today');
      expect(result.startDate.getTime()).toBe(today.startDate.getTime());
      expect(result.endDate.getTime()).toBe(today.endDate.getTime());
    });
  });

  describe('getRecentDates', () => {
    test('返回正确数量的日期', () => {
      const dates = getRecentDates(7);
      expect(dates).toHaveLength(7);
    });

    test('日期格式为 YYYY-MM-DD', () => {
      const dates = getRecentDates(3);
      dates.forEach(d => {
        expect(d).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      });
    });

    test('最后一天是今天（北京时间）', () => {
      const dates = getRecentDates(7);
      const dayjs = require('dayjs');
      require('dayjs/plugin/utc');
      require('dayjs/plugin/timezone');
      const utcPlugin = require('dayjs/plugin/utc');
      const tzPlugin = require('dayjs/plugin/timezone');
      dayjs.extend(utcPlugin);
      dayjs.extend(tzPlugin);
      const todayBJ = dayjs().tz('Asia/Shanghai').format('YYYY-MM-DD');
      expect(dates[dates.length - 1]).toBe(todayBJ);
    });

    test('日期按升序排列', () => {
      const dates = getRecentDates(7);
      for (let i = 1; i < dates.length; i++) {
        expect(dates[i] > dates[i - 1]).toBe(true);
      }
    });
  });

  describe('bjDateToUTC', () => {
    test('将北京时间日期字符串转为 UTC Date', () => {
      const utc = bjDateToUTC('2026-04-01');
      expect(utc instanceof Date).toBe(true);
      // 2026-04-01 00:00 北京时间 = 2026-03-31 16:00 UTC
      expect(utc.toISOString()).toBe('2026-03-31T16:00:00.000Z');
    });
  });
});
