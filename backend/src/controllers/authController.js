const jwt = require('jsonwebtoken');
const { User } = require('../models');
const jwtConfig = require('../config/jwt');

/**
 * 生成 JWT Token
 */
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, username: user.username, role: user.role },
    jwtConfig.secret,
    { expiresIn: jwtConfig.expiresIn }
  );
};

/**
 * 用户注册
 */
exports.register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    // 检查用户是否已存在
    const existingUser = await User.findOne({
      $or: [{ username }, { email }],
    });

    if (existingUser) {
      return res.status(400).json({
        code: 400,
        message: existingUser.username === username ? '用户名已存在' : '邮箱已被注册',
        data: null,
      });
    }

    // 创建用户（第一个用户设为管理员）
    const userCount = await User.countDocuments();
    const user = await User.create({
      username,
      email,
      password,
      role: userCount === 0 ? 'admin' : 'user',
    });

    // 生成 token
    const token = generateToken(user);

    res.status(201).json({
      code: 0,
      message: '注册成功',
      data: { token, user },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 用户登录
 */
exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    // 查找用户（需要包含密码字段）
    const user = await User.findOne({ username }).select('+password');

    if (!user) {
      return res.status(401).json({
        code: 401,
        message: '用户名或密码错误',
        data: null,
      });
    }

    // 验证密码
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        code: 401,
        message: '用户名或密码错误',
        data: null,
      });
    }

    // 生成 token
    const token = generateToken(user);

    res.json({
      code: 0,
      message: '登录成功',
      data: { token, user },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 获取当前用户信息
 */
exports.getProfile = async (req, res, next) => {
  try {
    res.json({
      code: 0,
      message: 'success',
      data: req.user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 更新当前用户信息
 */
exports.updateProfile = async (req, res, next) => {
  try {
    const { username, email, avatar } = req.body;

    // 检查用户名和邮箱是否被占用
    if (username || email) {
      const existingUser = await User.findOne({
        _id: { $ne: req.userId },
        $or: [
          ...(username ? [{ username }] : []),
          ...(email ? [{ email }] : []),
        ],
      });

      if (existingUser) {
        return res.status(400).json({
          code: 400,
          message: existingUser.username === username ? '用户名已存在' : '邮箱已被使用',
          data: null,
        });
      }
    }

    const user = await User.findByIdAndUpdate(
      req.userId,
      { username, email, avatar },
      { new: true, runValidators: true }
    );

    res.json({
      code: 0,
      message: '更新成功',
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 修改密码
 */
exports.updatePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;

    // 获取用户（包含密码）
    const user = await User.findById(req.userId).select('+password');

    // 验证旧密码
    const isMatch = await user.comparePassword(oldPassword);
    if (!isMatch) {
      return res.status(400).json({
        code: 400,
        message: '当前密码错误',
        data: null,
      });
    }

    // 更新密码
    user.password = newPassword;
    await user.save();

    res.json({
      code: 0,
      message: '密码修改成功',
      data: null,
    });
  } catch (error) {
    next(error);
  }
};
