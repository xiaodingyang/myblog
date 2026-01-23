module.exports = {
  secret: process.env.JWT_SECRET || 'default-jwt-secret',
  expiresIn: process.env.JWT_EXPIRES_IN || '7d',
};
