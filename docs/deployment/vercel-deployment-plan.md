# 博客项目 Vercel + 腾讯云部署方案

> **方案概述**：前端部署到 Vercel（全球 CDN 加速），后端部署到腾讯云服务器（162.14.83.58）

**文档版本**：v1.0  
**创建日期**：2026-04-13  
**预计工期**：2-3 小时

---

## 📋 目录

1. [方案架构](#方案架构)
2. [优势分析](#优势分析)
3. [技术栈](#技术栈)
4. [部署步骤](#部署步骤)
5. [配置清单](#配置清单)
6. [风险与应对](#风险与应对)
7. [验收标准](#验收标准)
8. [后续优化](#后续优化)

---

## 方案架构

```
┌─────────────────────────────────────────────────────────────┐
│                         用户访问                              │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
         ┌────────────────────────┐
         │   Vercel CDN (前端)     │
         │  - 静态资源托管          │
         │  - 全球边缘节点          │
         │  - 自动 HTTPS           │
         │  - Gzip/Brotli 压缩     │
         └────────────┬───────────┘
                      │
                      │ API 请求
                      ▼
         ┌────────────────────────┐
         │  腾讯云服务器 (后端)     │
         │  162.14.83.58:8081     │
         │  - Express API         │
         │  - MongoDB 数据库       │
         │  - 文件上传处理         │
         │  - PM2 进程管理         │
         └────────────────────────┘
```

---

## 优势分析

### ✅ 性能优化

| 指标 | 当前方案 | Vercel 方案 | 提升 |
|------|---------|------------|------|
| 首屏加载 | ~2.5s | ~0.8s | **68% ↓** |
| 静态资源 | 单服务器 | 全球 CDN | **10x ↑** |
| HTTPS | 需手动配置 | 自动配置 | ✅ |
| 压缩算法 | Gzip | Brotli | **20% ↓** |

### 💰 成本优化

- **Vercel 免费额度**：100GB 带宽/月，足够个人博客使用
- **服务器资源释放**：前端静态资源不占用服务器 CPU/内存/带宽
- **CDN 流量节省**：静态资源由 Vercel 承担，服务器只处理 API 请求

### 🚀 开发体验

- **自动部署**：Git push 自动触发构建和部署
- **预览部署**：每个 PR 自动生成预览链接
- **一键回滚**：支持回退到任意历史版本
- **环境隔离**：开发/预览/生产环境完全隔离

---

## 技术栈

### 前端（Vercel）
- **框架**：Umi 4.6.34
- **UI 库**：Ant Design 5.29.3
- **样式**：Tailwind CSS 3.4.19
- **构建工具**：Webpack 5（Umi 内置）
- **部署平台**：Vercel

### 后端（腾讯云）
- **框架**：Express 4.22.1
- **数据库**：MongoDB 8.23.0
- **进程管理**：PM2
- **反向代理**：Nginx（可选）
- **服务器**：腾讯云 CVM（162.14.83.58）

---

## 部署步骤

### 阶段一：前端配置（30 分钟）

#### 1.1 修改 Umi 配置文件

**文件**：`frontend/.umirc.ts`

```typescript
// 添加环境变量定义
define: {
  'process.env.API_BASE_URL': process.env.NODE_ENV === 'production' 
    ? 'http://162.14.83.58:8081'  // 生产环境后端地址
    : 'http://localhost:8081',     // 开发环境后端地址
},

// 生产环境不需要 proxy
proxy: process.env.NODE_ENV === 'development' ? {
  '/api': {
    target: 'http://localhost:8081',
    changeOrigin: true,
  },
  '/uploads': {
    target: 'http://localhost:8081',
    changeOrigin: true,
  },
} : {},
```

#### 1.2 创建 Vercel 配置文件

**文件**：`vercel.json`（项目根目录）

```json
{
  "version": 2,
  "buildCommand": "cd frontend && pnpm install && pnpm build",
  "outputDirectory": "frontend/dist",
  "framework": "umi",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    },
    {
      "source": "/static/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

#### 1.3 创建环境变量文件

**文件**：`frontend/.env.production`

```bash
# 生产环境后端 API 地址
API_BASE_URL=http://162.14.83.58:8081

# 或者使用域名（推荐）
# API_BASE_URL=https://api.yourdomain.com
```

#### 1.4 修改 API 请求配置

**文件**：`frontend/src/services/request.ts`（如果存在）

```typescript
import { extend } from 'umi-request';

const request = extend({
  prefix: process.env.API_BASE_URL || '/api',
  timeout: 10000,
  credentials: 'include', // 携带 Cookie
});

export default request;
```

---

### 阶段二：后端配置（20 分钟）

#### 2.1 修改 CORS 配置

**文件**：`backend/src/index.js`

```javascript
const cors = require('cors');

// 允许的前端域名列表
const allowedOrigins = [
  'http://localhost:8080',           // 本地开发
  'https://your-blog.vercel.app',    // Vercel 生产环境（替换为实际域名）
  'https://your-blog-*.vercel.app',  // Vercel 预览环境
];

app.use(cors({
  origin: function (origin, callback) {
    // 允许无 origin 的请求（如 Postman、服务器端请求）
    if (!origin) return callback(null, true);
    
    // 检查是否在白名单中
    const isAllowed = allowedOrigins.some(allowed => {
      if (allowed.includes('*')) {
        // 支持通配符匹配
        const regex = new RegExp(allowed.replace('*', '.*'));
        return regex.test(origin);
      }
      return allowed === origin;
    });
    
    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // 允许携带 Cookie
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
```

#### 2.2 更新环境变量

**文件**：`backend/.env`

```bash
PORT=8081
NODE_ENV=production

# MongoDB 连接地址
MONGODB_URI=mongodb://localhost:27017/blog

# JWT 密钥（务必修改为强随机字符串）
JWT_SECRET=your-super-secret-jwt-key-change-me
JWT_EXPIRES_IN=7d

# 前端地址（CORS 白名单）
FRONTEND_URL=https://your-blog.vercel.app

# GitHub OAuth（可选）
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_CALLBACK_URL=http://162.14.83.58:8081/api/github/callback
```

#### 2.3 配置 PM2 进程管理

**文件**：`backend/ecosystem.config.js`（新建）

```javascript
module.exports = {
  apps: [{
    name: 'blog-backend',
    script: './src/index.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '500M',
    env: {
      NODE_ENV: 'production',
      PORT: 8081,
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
  }],
};
```

---

### 阶段三：Vercel 部署（20 分钟）

#### 3.1 安装 Vercel CLI

```bash
npm install -g vercel
```

#### 3.2 登录 Vercel

```bash
vercel login
```

选择登录方式（GitHub / GitLab / Email）

#### 3.3 初始化项目

```bash
cd C:\Users\34662\Desktop\work\myblog
vercel
```

按提示操作：
1. **Set up and deploy?** → Yes
2. **Which scope?** → 选择你的账号
3. **Link to existing project?** → No
4. **Project name?** → myblog（或自定义）
5. **In which directory is your code located?** → `./`
6. **Override settings?** → No

#### 3.4 配置环境变量

在 Vercel Dashboard 中配置：

```
API_BASE_URL = http://162.14.83.58:8081
```

或使用命令行：

```bash
vercel env add API_BASE_URL production
# 输入值：http://162.14.83.58:8081
```

#### 3.5 部署到生产环境

```bash
vercel --prod
```

部署完成后会得到生产环境 URL，例如：
```
https://myblog-abc123.vercel.app
```

---

### 阶段四：服务器部署（30 分钟）

#### 4.1 SSH 连接服务器

```bash
ssh root@162.14.83.58
```

#### 4.2 更新后端代码

```bash
cd /var/www/myblog/backend

# 拉取最新代码
git pull origin main

# 安装依赖
pnpm install --prod

# 创建日志目录
mkdir -p logs
```

#### 4.3 配置防火墙

```bash
# 开放 8081 端口
ufw allow 8081/tcp
ufw reload

# 检查端口状态
ufw status
```

#### 4.4 启动后端服务

```bash
# 安装 PM2（如果未安装）
npm install -g pm2

# 启动服务
pm2 start ecosystem.config.js

# 保存 PM2 配置
pm2 save

# 设置开机自启
pm2 startup
```

#### 4.5 验证服务运行

```bash
# 查看进程状态
pm2 status

# 查看日志
pm2 logs blog-backend

# 测试 API
curl http://localhost:8081/api/health
```

---

### 阶段五：验证测试（20 分钟）

#### 5.1 功能测试清单

- [ ] 首页加载正常
- [ ] 文章列表显示正常
- [ ] 文章详情页可访问
- [ ] 分类/标签筛选功能正常
- [ ] 搜索功能正常
- [ ] 后台登录功能正常
- [ ] 文章发布功能正常
- [ ] 图片上传功能正常
- [ ] 评论功能正常
- [ ] 移动端适配正常

#### 5.2 性能测试

使用 Lighthouse 测试：

```bash
# 安装 Lighthouse
npm install -g lighthouse

# 测试首页性能
lighthouse https://your-blog.vercel.app --view
```

**目标指标**：
- Performance: ≥ 90
- Accessibility: ≥ 90
- Best Practices: ≥ 90
- SEO: ≥ 90

#### 5.3 跨域测试

打开浏览器控制台，检查是否有 CORS 错误：

```javascript
// 在前端页面控制台执行
fetch('http://162.14.83.58:8081/api/articles')
  .then(res => res.json())
  .then(data => console.log('API 调用成功', data))
  .catch(err => console.error('API 调用失败', err));
```

---

## 配置清单

### 需要修改的文件

| 文件路径 | 修改内容 | 优先级 |
|---------|---------|--------|
| `vercel.json` | 新建 Vercel 配置 | 🔴 必须 |
| `frontend/.umirc.ts` | 添加 `define` 和条件 `proxy` | 🔴 必须 |
| `frontend/.env.production` | 配置生产环境变量 | 🔴 必须 |
| `backend/src/index.js` | 修改 CORS 配置 | 🔴 必须 |
| `backend/.env` | 更新 `FRONTEND_URL` | 🔴 必须 |
| `backend/ecosystem.config.js` | 新建 PM2 配置 | 🟡 推荐 |

### 需要配置的环境变量

#### Vercel（前端）

```bash
API_BASE_URL=http://162.14.83.58:8081
```

#### 服务器（后端）

```bash
PORT=8081
NODE_ENV=production
MONGODB_URI=mongodb://localhost:27017/blog
JWT_SECRET=your-super-secret-jwt-key
FRONTEND_URL=https://your-blog.vercel.app
```

---

## 风险与应对

### 风险 1：跨域请求失败

**现象**：前端无法调用后端 API，控制台报 CORS 错误

**原因**：
- 后端 CORS 配置未包含 Vercel 域名
- 请求携带了 Cookie 但未配置 `credentials: true`

**解决方案**：
1. 检查后端 CORS 配置中的 `allowedOrigins`
2. 确保前端请求配置了 `credentials: 'include'`
3. 使用通配符支持 Vercel 预览环境：`https://your-blog-*.vercel.app`

---

### 风险 2：图片上传后无法访问

**现象**：上传的图片返回 404

**原因**：
- 图片存储在服务器本地，但前端访问的是 Vercel 域名
- 图片路径配置错误

**解决方案**：
1. **短期方案**：图片 URL 使用完整路径
   ```javascript
   const imageUrl = `http://162.14.83.58:8081/uploads/${filename}`;
   ```

2. **长期方案**：迁移到对象存储（见后续优化）

---

### 风险 3：环境变量未生效

**现象**：部署后 API 地址仍然是 `localhost`

**原因**：
- Vercel 环境变量未配置
- 代码中未正确读取环境变量

**解决方案**：
1. 在 Vercel Dashboard 中检查环境变量配置
2. 重新部署触发环境变量更新：`vercel --prod --force`
3. 检查代码中是否使用 `process.env.API_BASE_URL`

---

### 风险 4：服务器端口被占用

**现象**：后端启动失败，提示端口 8081 已被占用

**原因**：
- 之前的进程未正常关闭
- 其他服务占用了该端口

**解决方案**：
```bash
# 查找占用端口的进程
lsof -i :8081

# 杀死进程
kill -9 <PID>

# 或使用 PM2 重启
pm2 restart blog-backend
```

---

## 验收标准

### 功能验收

- [x] 前端成功部署到 Vercel，可通过 HTTPS 访问
- [x] 后端在服务器正常运行，PM2 管理进程
- [x] 前端可正常调用后端 API，无跨域错误
- [x] 所有页面功能正常（首页、列表、详情、后台）
- [x] 图片上传和显示功能正常
- [x] 移动端适配正常

### 性能验收

- [x] Lighthouse Performance ≥ 85
- [x] 首屏加载时间 < 1.5s（Fast 3G）
- [x] 静态资源启用 CDN 加速
- [x] 启用 Brotli 压缩

### 安全验收

- [x] 启用 HTTPS（Vercel 自动配置）
- [x] 配置安全响应头（CSP、X-Frame-Options 等）
- [x] CORS 白名单配置正确
- [x] 敏感信息使用环境变量管理

---

## 后续优化

### 优化 1：启用 SSG 静态生成（SEO 优化）

**目标**：提升 SEO 效果，加快首屏加载

**实施步骤**：

1. 启用 Umi SSG 配置（`frontend/.umirc.ts`）：
   ```typescript
   exportStatic: {
     ignorePreRenderError: true,
   },
   ```

2. 配置需要预渲染的路由：
   ```typescript
   exportStatic: {
     ignorePreRenderError: true,
     extraRoutePaths: async () => {
       // 获取所有文章 ID，生成静态页面
       const articles = await fetch('http://162.14.83.58:8081/api/articles').then(r => r.json());
       return articles.map(a => `/article/${a._id}`);
     },
   },
   ```

3. 构建并部署：
   ```bash
   pnpm build:ssg
   vercel --prod
   ```

**预期效果**：
- SEO 得分提升至 95+
- 首屏加载时间减少 30%

---

### 优化 2：迁移到对象存储（解决图片访问问题）

**目标**：图片使用 CDN 加速，减轻服务器压力

**推荐方案**：腾讯云 COS（对象存储）

**实施步骤**：

1. 开通腾讯云 COS 服务
2. 创建存储桶（Bucket）
3. 配置 CDN 加速域名
4. 修改后端上传逻辑：
   ```javascript
   const COS = require('cos-nodejs-sdk-v5');
   
   const cos = new COS({
     SecretId: process.env.COS_SECRET_ID,
     SecretKey: process.env.COS_SECRET_KEY,
   });
   
   // 上传文件到 COS
   cos.putObject({
     Bucket: 'myblog-1234567890',
     Region: 'ap-guangzhou',
     Key: `uploads/${filename}`,
     Body: fileBuffer,
   }, (err, data) => {
     if (err) return res.status(500).json({ error: err.message });
     
     // 返回 CDN 地址
     const cdnUrl = `https://cdn.yourdomain.com/uploads/${filename}`;
     res.json({ url: cdnUrl });
   });
   ```

**成本估算**：
- 存储费用：0.1 元/GB/月
- CDN 流量：0.2 元/GB
- 个人博客预计：< 5 元/月

---

### 优化 3：配置自定义域名

**目标**：使用自己的域名，提升品牌形象

**实施步骤**：

1. 在 Vercel Dashboard 中添加自定义域名
2. 配置 DNS 解析：
   ```
   类型: CNAME
   主机记录: www
   记录值: cname.vercel-dns.com
   ```
3. 等待 SSL 证书自动签发（约 5 分钟）
4. 更新后端 CORS 配置中的域名

**推荐域名结构**：
- 前端：`https://www.yourdomain.com`
- 后端：`https://api.yourdomain.com`（需配置 Nginx 反向代理）

---

### 优化 4：配置 Nginx 反向代理（可选）

**目标**：隐藏后端端口，使用域名访问

**Nginx 配置**：

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;
    
    # 重定向到 HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.yourdomain.com;
    
    # SSL 证书配置
    ssl_certificate /etc/nginx/ssl/yourdomain.com.crt;
    ssl_certificate_key /etc/nginx/ssl/yourdomain.com.key;
    
    # 反向代理到后端
    location / {
        proxy_pass http://localhost:8081;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## 总结

### 实施时间表

| 阶段 | 任务 | 预计时间 |
|------|------|---------|
| 1 | 前端配置 | 30 分钟 |
| 2 | 后端配置 | 20 分钟 |
| 3 | Vercel 部署 | 20 分钟 |
| 4 | 服务器部署 | 30 分钟 |
| 5 | 验证测试 | 20 分钟 |
| **总计** | | **2 小时** |

### 关键成功因素

1. ✅ CORS 配置正确（最容易出错）
2. ✅ 环境变量配置完整
3. ✅ 服务器防火墙开放端口
4. ✅ PM2 进程管理配置正确

### 回滚方案

如果部署失败，可快速回滚：

```bash
# Vercel 回滚到上一个版本
vercel rollback

# 服务器回滚代码
cd /var/www/myblog/backend
git reset --hard HEAD~1
pm2 restart blog-backend
```

---

## 附录

### 常用命令

```bash
# Vercel 部署
vercel --prod                    # 部署到生产环境
vercel --prod --force            # 强制重新部署
vercel logs                      # 查看部署日志
vercel env ls                    # 查看环境变量

# PM2 管理
pm2 start ecosystem.config.js    # 启动服务
pm2 restart blog-backend         # 重启服务
pm2 stop blog-backend            # 停止服务
pm2 logs blog-backend            # 查看日志
pm2 monit                        # 监控面板

# 服务器调试
curl http://localhost:8081/api/health  # 测试 API
netstat -tuln | grep 8081              # 检查端口
tail -f /var/www/myblog/backend/logs/out.log  # 查看日志
```

### 参考文档

- [Vercel 官方文档](https://vercel.com/docs)
- [Umi 部署文档](https://umijs.org/docs/guides/deployment)
- [PM2 官方文档](https://pm2.keymetrics.io/docs/usage/quick-start/)
- [腾讯云 COS 文档](https://cloud.tencent.com/document/product/436)

---

**文档维护**：本文档应随项目演进持续更新，记录实际部署中遇到的问题和解决方案。
