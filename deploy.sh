#!/usr/bin/env bash

###############################################################################
# 部署脚本：一键部署博客到远程服务器
#
# 使用方式：
#   1. 复制 deploy.sh.example 为 deploy.sh（如首次使用）
#   2. 修改下方 SERVER_HOST / SERVER_USER / APP_DIR 为你自己的服务器信息
#   3. 赋予脚本执行权限（只需一次）：chmod +x deploy.sh
#   4. 执行部署：./deploy.sh
#
# 脚本会做的事情（在远程服务器上）：
#   - cd 到项目目录
#   - git pull 拉取最新代码
#   - 安装前后端依赖
#   - 前端 pnpm build
#   - 使用 pm2 启动 / 重启 backend 服务
###############################################################################

set -e

# ========== 请修改为你自己的服务器信息 ==========
SERVER_HOST="${DEPLOY_HOST:-your-server-ip}"
SERVER_USER="${DEPLOY_USER:-root}"
APP_DIR="${DEPLOY_DIR:-/var/www/myblog}"
# ================================================

if [ "$SERVER_HOST" = "your-server-ip" ]; then
  echo "❌ 请先配置服务器信息！"
  echo "   编辑 deploy.sh 中的 SERVER_HOST, SERVER_USER, APP_DIR"
  echo "   或设置环境变量 DEPLOY_HOST, DEPLOY_USER, DEPLOY_DIR"
  exit 1
fi

echo "🚀 开始部署到 ${SERVER_USER}@${SERVER_HOST}:${APP_DIR} ..."

ssh "${SERVER_USER}@${SERVER_HOST}" << EOF
set -e

echo "📁 进入项目目录 ..."
cd ${APP_DIR}

echo "🧹 清理构建缓存 ..."
rm -rf frontend/src/.umi-production
rm -rf frontend/src/.umi
git checkout -- . 2>/dev/null || true

echo "📥 拉取最新代码 ..."
git pull

echo "📦 安装前端依赖并打包 ..."
cd frontend
pnpm install --frozen-lockfile || pnpm install
pnpm build

echo "📦 安装评论子应用依赖并打包 ..."
cd ../myblog-comment-mf
pnpm install --frozen-lockfile || pnpm install
pnpm build

echo "📦 安装后端依赖 ..."
cd ../backend
pnpm install --frozen-lockfile || pnpm install

echo "🟢 启动 / 重启后端服务 (pm2) ..."
pm2 start src/index.js --name blog-api || pm2 restart blog-api
pm2 save

echo "✅ 远程部署完成。"
EOF

echo "✅ 部署脚本执行完成。"
