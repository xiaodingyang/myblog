# 📁 项目结构说明

本文档说明 myblog 项目的目录结构和文件组织方式。

---

## 📂 根目录结构

```
myblog/
├── README.md                    # 项目说明文档
├── LICENSE                      # 开源协议
├── package.json                 # 项目依赖配置（monorepo）
├── pnpm-workspace.yaml          # pnpm 工作区配置
├── pnpm-lock.yaml               # 依赖锁定文件
│
├── frontend/                    # 🎨 前端项目（Umi + React）
├── backend/                     # 🔧 后端项目（Express + MongoDB）
├── docs/                        # 📚 项目文档
├── scripts/                     # 🛠️ 脚本工具
├── config/                      # ⚙️ 配置文件
└── archive/                     # 📦 归档文件
```

---

## 📂 详细目录说明

### 🎨 [frontend/](./frontend/) - 前端项目

基于 Umi 4 + React 18 的前端应用。

```
frontend/
├── src/                         # 源代码
│   ├── pages/                   # 页面组件
│   ├── components/              # 公共组件
│   ├── layouts/                 # 布局组件
│   ├── services/                # API 服务
│   ├── utils/                   # 工具函数
│   └── styles/                  # 样式文件
│
├── public/                      # 静态资源
├── dist/                        # 构建输出（生产环境）
├── e2e/                         # E2E 测试
├── tests/                       # 单元测试
│
├── .umirc.ts                    # Umi 配置文件
├── .env                         # 开发环境变量
├── .env.production              # 生产环境变量
├── package.json                 # 前端依赖
├── tsconfig.json                # TypeScript 配置
├── tailwind.config.js           # Tailwind CSS 配置
└── playwright.config.ts         # Playwright 测试配置
```

**部署信息**:
- 生产环境: 腾讯云服务器
- 域名: https://www.xiaodingyang.art

---

### 🔧 [backend/](./backend/) - 后端项目

基于 Express + MongoDB 的后端 API 服务。

```
backend/
├── src/                         # 源代码
│   ├── routes/                  # 路由定义
│   ├── controllers/             # 控制器
│   ├── models/                  # 数据模型
│   ├── middleware/              # 中间件
│   ├── utils/                   # 工具函数
│   └── index.js                 # 入口文件
│
├── tests/                       # 测试文件
├── uploads/                     # 上传文件存储
│
├── .env                         # 开发环境变量
├── .env.production              # 生产环境变量模板
├── ecosystem.config.js          # PM2 配置
└── package.json                 # 后端依赖
```

**部署信息**:
- 生产环境: 腾讯云服务器（162.14.83.58）
- 端口: 8081
- API 地址: https://www.xiaodingyang.art/api
- 进程管理: PM2

---

### 📚 [docs/](./docs/) - 项目文档

所有技术文档，按类别分文件夹组织。

```
docs/
├── README.md                    # 文档索引（导航指南）
│
├── deployment/                  # 🚀 部署运维类
│   ├── deployment-summary.md          # 当前部署状态
│   ├── new-backend-deployment-guide.md # 新后端部署指南
│   ├── scalability-analysis.md
│   ├── migration-guide.md
│   ├── nginx-scalable-config.conf
│   └── CI-CD自动化部署总结.md
│
├── feature-design/              # 🎨 功能设计类
│   ├── PRJ-博客需求总览.md
│   ├── PRJ-优化计划与功能需求.md
│   ├── 计数功能PRD.md
│   ├── 计数功能UI设计规格.md
│   ├── 计数功能UI设计审查报告.md
│   ├── 访客统计优化方案.md
│   ├── BUG_REPORT.md                  # Bug 报告模板
│   └── CONTRIBUTING.md                # 贡献指南
│
├── technical/                   # 🔧 技术实现类
│   ├── GitHub-OAuth登录与评论系统实战总结.md
│   ├── 首屏性能优化总结.md
│   ├── SEO优化实战总结.md
│   ├── 前端性能与工程化优化实战总结.md
│   ├── 前端埋点SDK实现原理.md
│   ├── NGINX_CACHE_SETUP.md           # Nginx 缓存配置
│   ├── OPTIMIZATION_SUMMARY.md        # 优化总结
│   └── PERFORMANCE_OPTIMIZATION.md    # 性能优化
│
├── architecture/                # 🏗️ 架构设计类
│   └── 架构优化方案.md
│
└── tests/                       # 🧪 测试相关
```

**使用指南**: 查看 [docs/README.md](./docs/README.md)

---

### 🛠️ [scripts/](./scripts/) - 脚本工具

项目相关的脚本和工具。

```
scripts/
├── migrate-nginx-config.sh      # Nginx 配置迁移脚本
├── import-db.js                 # 数据库导入脚本
├── start-mongodb.js             # MongoDB 启动脚本
├── deploy.sh                    # 部署脚本
└── proxy-server.js              # 代理服务器
```

---

### ⚙️ [config/](./config/) - 配置文件

项目级别的配置文件。

```
config/
└── nginx.conf                   # Nginx 配置（参考）
```

**注意**: 
- `nginx.conf` 仅供参考，实际生产配置在服务器 `/etc/nginx/conf.d/myblog.conf`

---

### 📦 [archive/](./archive/) - 归档文件

历史文件和报告归档。

```
archive/
├── reports/                     # 性能测试报告
│   ├── baseline-desktop.report.html
│   ├── baseline-desktop.report.json
│   ├── baseline-mobile.report.html
│   ├── baseline-mobile.report.json
│   └── baseline-performance-report.md
│
└── backups/                     # 数据库备份
    └── blog-backup-20260412/
```

**说明**: 
- 性能报告由 Lighthouse CI 生成
- 数据库备份定期归档

---

## 🚀 快速开始

### 1. 克隆项目
```bash
git clone <repo-url>
cd myblog
```

### 2. 安装依赖
```bash
# 使用 pnpm（推荐）
pnpm install

# 或使用 npm
npm install
```

### 3. 启动开发环境

**前端**:
```bash
cd frontend
pnpm dev
# 访问 http://localhost:8000
```

**后端**:
```bash
cd backend
pnpm dev
# API 运行在 http://localhost:8081
```

---

## 📝 环境变量配置

### 前端环境变量

**开发环境** (`frontend/.env`):
```env
API_BASE_URL=http://localhost:8081
```

**生产环境** (`frontend/.env.production`):
```env
API_BASE_URL=https://www.xiaodingyang.art/api
```

### 后端环境变量

**开发环境** (`backend/.env`):
```env
PORT=8081
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/blog
JWT_SECRET=your-secret-key
FRONTEND_URL=http://localhost:8000
```

**生产环境** (`backend/.env.production`):
```env
PORT=8081
NODE_ENV=production
MONGODB_URI=mongodb://localhost:27017/blog
JWT_SECRET=your-secret-key
FRONTEND_URL=https://www.xiaodingyang.art
```

---

## 🔧 常用命令

### 前端命令
```bash
cd frontend

# 开发
pnpm dev

# 构建
pnpm build

# 测试
pnpm test

# E2E 测试
pnpm test:e2e

# Lighthouse 性能测试
pnpm lighthouse
```

### 后端命令
```bash
cd backend

# 开发
pnpm dev

# 生产环境启动
pnpm start

# 测试
pnpm test
```

### 部署命令
```bash
# 前端部署到腾讯云
cd frontend
npm run build
# 上传 dist 目录到服务器

# 后端部署到服务器
# 参考 docs/deployment/new-backend-deployment-guide.md
```

---

## 📊 技术栈

### 前端
- **框架**: Umi 4 + React 18
- **语言**: TypeScript
- **样式**: Tailwind CSS + Ant Design
- **状态管理**: React Query
- **测试**: Playwright + Jest
- **构建**: Webpack 5
- **部署**: 腾讯云服务器

### 后端
- **框架**: Express.js
- **语言**: JavaScript (Node.js)
- **数据库**: MongoDB
- **认证**: JWT + GitHub OAuth
- **进程管理**: PM2
- **部署**: 腾讯云服务器

### 运维
- **Web 服务器**: Nginx
- **CI/CD**: GitHub Actions
- **监控**: PM2 + Nginx 日志
- **性能测试**: Lighthouse CI

---

## 📖 相关文档

### 新手入门
1. [项目需求总览](./docs/feature-design/PRJ-博客需求总览.md)
2. [当前部署状态](./docs/deployment/deployment-summary.md)
3. [系统架构](./docs/architecture/架构优化方案.md)

### 开发指南
1. [贡献指南](./docs/feature-design/CONTRIBUTING.md)
2. [Bug 报告](./docs/feature-design/BUG_REPORT.md)
3. [性能优化](./docs/technical/首屏性能优化总结.md)

### 部署指南
1. [新后端部署](./docs/deployment/new-backend-deployment-guide.md)
2. [Nginx 配置](./docs/deployment/scalability-analysis.md)

---

## 🤝 贡献

欢迎贡献代码！请先阅读 [贡献指南](./docs/feature-design/CONTRIBUTING.md)。

---

## 📄 许可证

本项目采用 [LICENSE](./LICENSE) 许可证。

---

## 📞 联系方式

- 项目地址: https://www.xiaodingyang.art
- 问题反馈: [GitHub Issues](https://github.com/your-repo/issues)

---

*最后更新: 2026-04-13*
*维护者: 请在更新项目结构后同步更新本文档*
