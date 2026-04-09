const { maskIP } = require('../src/utils/ipHelper');

describe('ipHelper', () => {
  describe('maskIP', () => {
    test('IPv4 脱敏保留前两段', () => {
      expect(maskIP('192.168.1.100')).toBe('192.168.*.*');
    });

    test('IPv4 其他地址', () => {
      expect(maskIP('10.0.0.1')).toBe('10.0.*.*');
    });

    test('IPv6 保留前 4 段', () => {
      expect(maskIP('2001:0db8:85a3:0001:0002:8a2e:0370:7334')).toBe('2001:0db8:85a3:0001:****');
    });

    test('空字符串返回空', () => {
      expect(maskIP('')).toBe('');
    });

    test('null/undefined 返回空', () => {
      expect(maskIP(null)).toBe('');
      expect(maskIP(undefined)).toBe('');
    });

    test('非 IP 字符串原样返回', () => {
      expect(maskIP('unknown')).toBe('unknown');
    });
  });
});
