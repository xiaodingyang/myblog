/**
 * 在 MongoDB 中创建或更新 E2E / 可视化测试用管理员账号（走 User 模型与 bcrypt，与登录接口一致）
 *
 * 用法（在 backend 目录或 monorepo 根用 filter）：
 *   pnpm --filter blog-backend db:ensure-e2e-admin
 *
 * 环境变量（可选）：
 *   MONGODB_URI、E2E_ADMIN_USERNAME（默认 ruofeng）、E2E_ADMIN_PASSWORD（默认 123456）、E2E_ADMIN_EMAIL（默认 ruofeng@e2e.local）
 */
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/User');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/blog';
const USERNAME = process.env.E2E_ADMIN_USERNAME || 'ruofeng';
const PASSWORD = process.env.E2E_ADMIN_PASSWORD || '123456';
const EMAIL = process.env.E2E_ADMIN_EMAIL || 'ruofeng@e2e.local';

async function main() {
  await mongoose.connect(MONGODB_URI);
  const existing = await User.findOne({ username: USERNAME }).select('+password');
  if (existing) {
    existing.password = PASSWORD;
    existing.role = 'admin';
    await existing.save();
    console.log(`✅ 已更新用户「${USERNAME}」密码与 role=admin`);
  } else {
    await User.create({
      username: USERNAME,
      email: EMAIL,
      password: PASSWORD,
      role: 'admin',
    });
    console.log(`✅ 已创建用户「${USERNAME}」role=admin`);
  }
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
