#!/usr/bin/env bash

###############################################################################
# 部署脚本：一键部署到生产服务器 162.14.83.58
#
# 使用方式：
#   1. 在本机终端中，进入项目根目录（包含本脚本的目录）：
#        cd /path/to/myblog
#   2. 赋予脚本执行权限（只需一次）：
#        chmod +x deploy.sh
#   3. 执行部署（会提示输入 root 密码）：
#        ./deploy.sh
#
# 脚本会做的事情（在远程服务器上）：
#   - cd /var/www/myblog
#   - git pull
#   - 安装前后端依赖
#   - 前端 pnpm build
#   - 使用 pm2 启动 / 重启 backend 服务
###############################################################################

set -e

SERVER_HOST="162.14.83.58"
SERVER_USER="root"
APP_DIR="/var/www/myblog"

echo "🚀 开始部署到 ${SERVER_USER}@${SERVER_HOST} ..."

ssh "${SERVER_USER}@${SERVER_HOST}" << 'EOF'
set -e

echo "📁 进入项目目录 ..."
cd /var/www/myblog

echo "📥 拉取最新代码 ..."
git pull

echo "📦 安装前端依赖并打包 ..."
cd frontend
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

