const secret = process.env.JWT_SECRET;

if (!secret && process.env.NODE_ENV === 'production') {
  console.error('❌ JWT_SECRET 环境变量未设置，生产环境必须配置！');
  process.exit(1);
}

module.exports = {
  secret: secret || 'dev-only-jwt-secret',
  expiresIn: process.env.JWT_EXPIRES_IN || '7d',
};
