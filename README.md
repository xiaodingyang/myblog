# 个人博客系统

一个基于 **Umi 4 + Ant Design 5 + Express + MongoDB** 的全栈个人博客系统。

## 🌟 特性

### 前台功能
- 📝 文章列表、详情展示，支持 Markdown 渲染
- 🗂️ 文章分类、标签筛选
- 🔍 文章搜索
- 💬 留言板
- 📱 响应式设计，支持移动端

### 后台功能
- 📊 数据统计仪表盘
- ✍️ 文章管理（CRUD、草稿/发布状态）
- 📁 分类管理
- 🏷️ 标签管理
- 💬 留言审核
- 👤 个人设置

## 🛠️ 技术栈

### 前端
- **框架**: React 18 + Umi 4
- **UI 库**: Ant Design 5.x
- **样式**: Tailwind CSS 3.x
- **状态管理**: Umi Model
- **Markdown**: react-markdown + remark-gfm

### 后端
- **运行时**: Node.js 18+
- **框架**: Express.js
- **数据库**: MongoDB + Mongoose
- **认证**: JWT (jsonwebtoken)
- **验证**: Joi
- **文件上传**: Multer

## 📁 项目结构

```
├── frontend/                # 前端项目
│   ├── src/
│   │   ├── components/      # 公共组件
│   │   ├── layouts/         # 布局组件
│   │   ├── models/          # 全局状态
│   │   ├── pages/           # 页面组件
│   │   │   ├── home/        # 首页
│   │   │   ├── articles/    # 文章
│   │   │   ├── categories/  # 分类
│   │   │   ├── tags/        # 标签
│   │   │   ├── message/     # 留言
│   │   │   ├── about/       # 关于
│   │   │   └── admin/       # 后台管理
│   │   └── app.tsx          # 应用入口
│   ├── mock/                # Mock 数据
│   ├── .umirc.ts            # Umi 配置
│   └── package.json
│
├── backend/                 # 后端项目
│   ├── src/
│   │   ├── config/          # 配置文件
│   │   ├── controllers/     # 控制器
│   │   ├── middlewares/     # 中间件
│   │   ├── models/          # 数据模型
│   │   ├── routes/          # 路由
│   │   ├── scripts/         # 脚本
│   │   └── index.js         # 入口文件
│   ├── uploads/             # 文件上传目录
│   └── package.json
│
└── README.md
```

## 🚀 快速开始

### 环境要求
- Node.js 18+
- MongoDB 6+
- pnpm 8+

### 1. 克隆项目

```bash
git clone <repository-url>
cd 博客
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
# 后端配置
cd backend
cp .env.example .env
# 编辑 .env 文件，配置数据库连接等
```

### 4. 初始化数据库

```bash
cd backend
node src/scripts/seed.js
```

### 5. 启动项目

```bash
# 启动后端 (端口 3000)
cd backend
pnpm dev

# 启动前端 (端口 8000)
cd frontend
pnpm dev
```

### 6. 访问项目

- 前台: http://localhost:8000
- 后台: http://localhost:8000/admin/login
- 默认账号: admin / admin123

## 📝 API 文档

### 认证接口
| 方法 | 路径 | 描述 |
|------|------|------|
| POST | /api/auth/register | 用户注册 |
| POST | /api/auth/login | 用户登录 |
| GET | /api/auth/profile | 获取用户信息 |
| PUT | /api/auth/profile | 更新用户信息 |
| PUT | /api/auth/password | 修改密码 |

### 文章接口
| 方法 | 路径 | 描述 |
|------|------|------|
| GET | /api/articles | 获取文章列表 |
| GET | /api/articles/:id | 获取文章详情 |
| GET | /api/admin/articles | 获取文章列表(后台) |
| POST | /api/admin/articles | 创建文章 |
| PUT | /api/admin/articles/:id | 更新文章 |
| DELETE | /api/admin/articles/:id | 删除文章 |

### 分类接口
| 方法 | 路径 | 描述 |
|------|------|------|
| GET | /api/categories | 获取分类列表 |
| POST | /api/admin/categories | 创建分类 |
| PUT | /api/admin/categories/:id | 更新分类 |
| DELETE | /api/admin/categories/:id | 删除分类 |

### 标签接口
| 方法 | 路径 | 描述 |
|------|------|------|
| GET | /api/tags | 获取标签列表 |
| POST | /api/admin/tags | 创建标签 |
| PUT | /api/admin/tags/:id | 更新标签 |
| DELETE | /api/admin/tags/:id | 删除标签 |

### 留言接口
| 方法 | 路径 | 描述 |
|------|------|------|
| GET | /api/messages | 获取留言列表 |
| POST | /api/messages | 提交留言 |
| GET | /api/admin/messages | 获取留言列表(后台) |
| PUT | /api/admin/messages/:id/review | 审核留言 |
| DELETE | /api/admin/messages/:id | 删除留言 |

### 其他接口
| 方法 | 路径 | 描述 |
|------|------|------|
| POST | /api/upload | 文件上传 |
| GET | /api/admin/statistics | 获取统计数据 |

## 🔧 配置说明

### 前端配置 (.umirc.ts)

```typescript
export default defineConfig({
  proxy: {
    '/api': {
      target: 'http://localhost:3000',
      changeOrigin: true,
    },
  },
});
```

### 后端配置 (.env)

```bash
PORT=3000
MONGODB_URI=mongodb://localhost:27017/blog
JWT_SECRET=your-jwt-secret
JWT_EXPIRES_IN=7d
```

## 📦 部署

### 前端部署

```bash
cd frontend
pnpm build
# 将 dist 目录部署到静态服务器
```

### 后端部署

```bash
cd backend
# 使用 PM2 启动
pm2 start src/index.js --name blog-api
```

### Nginx 配置示例

```nginx
server {
    listen 80;
    server_name yourdomain.com;

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
    }

    # 上传文件
    location /uploads {
        proxy_pass http://127.0.0.1:3000;
    }
}
```

## 📄 License

MIT License
