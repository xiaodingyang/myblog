/**
 * Auth Service
 */
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const jwtConfig = require('../config/jwt');

function generateToken(user) {
  return jwt.sign(
    { id: user._id, username: user.username, role: user.role },
    jwtConfig.secret,
    { expiresIn: jwtConfig.expiresIn }
  );
}

async function register({ username, email, password }) {
  const existingUser = await User.findOne({ $or: [{ username }, { email }] });
  if (existingUser) {
    const err = new Error(existingUser.username === username ? '用户名已存在' : '邮箱已被注册');
    err.code = 400;
    err.field = existingUser.username === username ? 'username' : 'email';
    throw err;
  }

  const userCount = await User.countDocuments();
  const user = await User.create({ username, email, password, role: userCount === 0 ? 'admin' : 'user' });
  const token = generateToken(user);
  return { token, user };
}

async function login({ username, password }) {
  const user = await User.findOne({ username }).select('+password');
  if (!user) {
    const err = new Error('用户名或密码错误');
    err.code = 401;
    throw err;
  }
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    const err = new Error('用户名或密码错误');
    err.code = 401;
    throw err;
  }
  const token = generateToken(user);
  return { token, user };
}

async function updateProfile(userId, { username, email, avatar }) {
  if (username || email) {
    const existingUser = await User.findOne({
      _id: { $ne: userId },
      $or: [
        ...(username ? [{ username }] : []),
        ...(email ? [{ email }] : []),
      ],
    });
    if (existingUser) {
      const err = new Error(existingUser.username === username ? '用户名已存在' : '邮箱已被使用');
      err.code = 400;
      err.field = existingUser.username === username ? 'username' : 'email';
      throw err;
    }
  }
  return User.findByIdAndUpdate(userId, { username, email, avatar }, { new: true, runValidators: true });
}

async function updatePassword(userId, { oldPassword, newPassword }) {
  const user = await User.findById(userId).select('+password');
  const isMatch = await user.comparePassword(oldPassword);
  if (!isMatch) {
    const err = new Error('当前密码错误');
    err.code = 400;
    throw err;
  }
  user.password = newPassword;
  await user.save();
}

module.exports = { generateToken, register, login, updateProfile, updatePassword };
