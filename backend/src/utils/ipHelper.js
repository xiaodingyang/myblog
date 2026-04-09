/**
 * 脱敏 IP 地址（保留前两段）
 * @param {string} ip - 原始 IP
 * @returns {string} 脱敏后的 IP（如 192.168.*.*）
 */
function maskIP(ip) {
  if (!ip) return '';

  // IPv4
  if (ip.includes('.')) {
    return ip.replace(/(\d+\.\d+)\.\d+\.\d+/, '$1.*.*');
  }

  // IPv6（保留前 4 段）
  if (ip.includes(':')) {
    const parts = ip.split(':');
    return parts.slice(0, 4).join(':') + ':****';
  }

  return ip;
}

module.exports = { maskIP };
