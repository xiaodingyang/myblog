# 个人博客系统

一个基于 **Umi 4 + Ant Design 5 + Express + MongoDB** 的全栈个人博客系统，支持 Markdown 写作、分类标签管理、留言板、后台管理等功能。

## 预览

> 如果你有在线演示地址，可以在这里添加截图或链接。

## 特性

### 前台

- 文章列表、详情展示，支持 Markdown 渲染与代码高亮
- 文章分类、标签筛选
- 文章搜索
- 留言板
- 响应式设计，支持移动端
- 粒子动画背景

### 后台管理

- 数据统计仪表盘
- 文章管理（创建、编辑、删除，支持草稿/发布状态）
- 分类管理
- 标签管理
- 留言审核
- 个人设置

## 技术栈

| 层级 | 技术 |
|------|------|
| **前端框架** | React 18 + Umi 4 |
| **UI 组件** | Ant Design 5.x |
| **样式** | Tailwind CSS 3.x |
| **状态管理** | Umi Model |
| **Markdown** | react-markdown + remark-gfm + rehype-highlight |
| **后端框架** | Express.js |
| **数据库** | MongoDB + Mongoose |
| **认证** | JWT (jsonwebtoken) |
| **数据验证** | Joi |
| **文件上传** | Multer |

## 项目结构

```
myblog/
├── frontend/                # 前端项目
│   ├── src/
│   │   ├── components/      # 公共组件
│   │   ├── config/          # 主题配置
│   │   ├── layouts/         # 布局组件
│   │   ├── models/          # 全局状态
│   │   ├── pages/           # 页面
│   │   │   ├── home/        # 首页
│   │   │   ├── articles/    # 文章列表与详情
│   │   │   ├── categories/  # 分类
│   │   │   ├── tags/        # 标签
│   │   │   ├── message/     # 留言板
│   │   │   ├── about/       # 关于
│   │   │   └── admin/       # 后台管理
│   │   └── app.tsx          # 应用入口
│   ├── .umirc.ts            # Umi 配置
│   └── package.json
│
├── backend/                 # 后端项目
│   ├── src/
│   │   ├── config/          # 配置（数据库、JWT）
│   │   ├── controllers/     # 控制器
│   │   ├── middlewares/      # 中间件（认证、错误处理、验证）
│   │   ├── models/          # 数据模型
│   │   ├── routes/          # 路由
│   │   ├── scripts/         # 数据库种子脚本
│   │   └── index.js         # 入口文件
│   ├── uploads/             # 上传文件目录
│   ├── .env.example         # 环境变量模板
│   └── package.json
│
├── deploy.sh                # 部署脚本
├── LICENSE
└── README.md
```

## 快速开始

### 环境要求

- Node.js 18+
- MongoDB 6+
- pnpm 8+

### 1. 克隆项目

```bash
git clone https://github.com/your-username/myblog.git
cd myblog
```

### 2. 安装依赖

```bash
# 前端
cd frontend
pnpm install

# 后端
cd ../backend
pnpm install
```

### 3. 配置环境变量

```bash
cd backend
cp .env.example .env
# 编辑 .env 文件，配置数据库连接和 JWT 密钥
```

### 4. 初始化数据库

```bash
cd backend
node src/scripts/seed.js
```

这会创建默认管理员账号和示例数据。

### 5. 启动开发服务器

```bash
# 启动后端（端口 3000）
cd backend
pnpm dev

# 新开终端，启动前端（端口 8001）
cd frontend
pnpm dev
```

### 6. 访问

- 前台: http://localhost:8001
- 后台: http://localhost:8001/admin/login
- 默认管理员: `admin` / `admin123`

> 首次登录后请尽快修改默认密码。

## API 接口

### 认证

| 方法 | 路径 | 描述 |
|------|------|------|
| POST | /api/auth/register | 用户注册 |
| POST | /api/auth/login | 用户登录 |
| GET | /api/auth/profile | 获取用户信息 |
| PUT | /api/auth/profile | 更新用户信息 |
| PUT | /api/auth/password | 修改密码 |

### 文章

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | /api/articles | 获取文章列表 |
| GET | /api/articles/:id | 获取文章详情 |
| POST | /api/admin/articles | 创建文章 |
| PUT | /api/admin/articles/:id | 更新文章 |
| DELETE | /api/admin/articles/:id | 删除文章 |

### 分类

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | /api/categories | 获取分类列表 |
| POST | /api/admin/categories | 创建分类 |
| PUT | /api/admin/categories/:id | 更新分类 |
| DELETE | /api/admin/categories/:id | 删除分类 |

### 标签

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | /api/tags | 获取标签列表 |
| POST | /api/admin/tags | 创建标签 |
| PUT | /api/admin/tags/:id | 更新标签 |
| DELETE | /api/admin/tags/:id | 删除标签 |

### 留言

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | /api/messages | 获取留言列表 |
| POST | /api/messages | 提交留言 |
| GET | /api/admin/messages | 获取留言列表（后台） |
| PUT | /api/admin/messages/:id/review | 审核留言 |
| DELETE | /api/admin/messages/:id | 删除留言 |

### 其他

| 方法 | 路径 | 描述 |
|------|------|------|
| POST | /api/upload | 文件上传 |
| GET | /api/admin/statistics | 获取统计数据 |
| GET | /health | 健康检查 |

## 部署

### 前端构建

```bash
cd frontend
pnpm build
# dist 目录即为构建产物，部署到 Nginx 等静态服务器
```

### 后端启动

```bash
cd backend
# 使用 PM2 守护进程
pm2 start src/index.js --name blog-api
pm2 save
```

### 一键部署

项目提供了 `deploy.sh` 脚本，编辑脚本中的服务器信息后即可一键部署：

```bash
# 修改 deploy.sh 中的 SERVER_HOST、SERVER_USER、APP_DIR
# 或通过环境变量设置：
export DEPLOY_HOST=your-server-ip
export DEPLOY_USER=root
export DEPLOY_DIR=/var/www/myblog

./deploy.sh
```

### Nginx 配置示例

```nginx
server {
    listen 80;
    server_name xiaodingyang.art;

    # 前端静态文件
    location / {
        root /path/to/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # API 代理
    location /api {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # 上传文件代理
    location /uploads {
        proxy_pass http://127.0.0.1:3000;
    }
}
```

## 参与贡献

欢迎提交 Issue 和 Pull Request！请参阅 [CONTRIBUTING.md](./CONTRIBUTING.md) 了解详情。

## License

[MIT](./LICENSE)
