# 新后端服务部署建议

## 📌 阅读说明

本文档面向未来开发新后端服务的开发者（或 AI 助手）。在开始部署新后端服务之前，请仔细阅读本文档，它将帮助你：
- 避免端口冲突
- 遵循统一的 API 路径规范
- 快速完成 Nginx 配置
- 保持系统的可扩展性

---

## 🎯 当前服务器状态

### 已部署的服务

| 服务名称 | 端口 | API 路径 | 状态 | 备注 |
|---------|------|---------|------|------|
| 博客后端 v1 | 3000 | `/api/` | 运行中 | 旧版本，待迁移到 8080 |
| 博客后端 v2 | 8081 | `/vercel-api/` | 运行中 | 当前生产环境 |

### 端口规划

```
生产环境端口段: 8080-8089
├── 8080: 博客后端 v1（预留，待迁移）
├── 8081: 博客后端 v2（已使用）
├── 8082: 新后端服务 1（可用）
├── 8083: 新后端服务 2（可用）
├── 8084: 新后端服务 3（可用）
└── 8085-8089: 未来扩展（可用）

开发环境端口段: 3000-3999
├── 3000: 博客后端 v1（临时保留）
├── 3001-3999: 本地开发使用
```

**重要**: 新后端服务请使用 **8082** 端口（或 8083、8084...），不要使用 3000-3999 段。

---

## 📐 API 路径设计规范

### 推荐格式

```
/api/v{version}/{service-name}/{resource}
```

### 路径组成说明

| 部分 | 说明 | 示例 |
|------|------|------|
| `/api/` | 固定前缀 | `/api/` |
| `v{version}` | API 版本号 | `v1`, `v2`, `v3` |
| `{service-name}` | 服务名称（小写，短横线分隔） | `blog`, `user`, `payment`, `analytics` |
| `{resource}` | 资源路径 | `articles`, `profile`, `orders` |

### 正确示例

```
✅ /api/v1/user/profile              # 用户服务 - 个人资料
✅ /api/v1/user/settings             # 用户服务 - 设置
✅ /api/v1/payment/orders            # 支付服务 - 订单列表
✅ /api/v1/payment/orders/123        # 支付服务 - 订单详情
✅ /api/v1/analytics/stats           # 分析服务 - 统计数据
✅ /api/v2/blog/articles             # 博客服务 v2 - 文章列表
```

### 错误示例

```
❌ /user-api/profile                 # 缺少版本号
❌ /api/user/profile                 # 缺少版本号
❌ /api/v1/getUserProfile            # 使用驼峰命名
❌ /vercel-api/articles              # 不语义化的命名
❌ /api/v1/articles                  # 缺少服务名称
```

### 为什么要遵循这个规范？

1. **版本控制**: 支持 API 平滑升级（v1 → v2），旧版本可以继续运行
2. **服务隔离**: 不同服务的 API 路径清晰分离，便于管理
3. **语义化**: 路径一眼就能看出是哪个服务的哪个资源
4. **可扩展**: 新增服务只需添加新的 `{service-name}` 即可

---

## 🔧 后端代码配置建议

### 1. 端口配置（使用环境变量）

```javascript
// ✅ 推荐：从环境变量读取
const PORT = process.env.PORT || 8082;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

```python
# Python (Flask/FastAPI)
import os
PORT = int(os.getenv('PORT', 8082))

app.run(host='0.0.0.0', port=PORT)
```

### 2. CORS 配置（支持多域名）

```javascript
// Node.js (Express)
const cors = require('cors');

app.use(cors({
  origin: process.env.FRONTEND_URL.split(','),  // 支持多个域名，逗号分隔
  credentials: true,
}));
```

**环境变量示例** (`.env.production`):
```env
PORT=8082
NODE_ENV=production
FRONTEND_URL=https://frontend-ary348pbe-xiaodingyangs-projects.vercel.app,https://www.xiaodingyang.art
```

### 3. API 路由设计

```javascript
// ✅ 推荐：路由与 Nginx 路径对应
// Nginx: /api/v1/user/ → 后端: /api/
app.use('/api', userRoutes);

// 路由定义
router.get('/profile', getProfile);        // 完整路径: /api/v1/user/profile
router.get('/settings', getSettings);      // 完整路径: /api/v1/user/settings
router.post('/avatar', uploadAvatar);      // 完整路径: /api/v1/user/avatar
```

### 4. 健康检查端点（必须）

```javascript
// 每个服务都应该提供健康检查端点
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'user-service',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});
```

---

## 🚀 部署步骤（快速上手）

### 步骤 1: 准备后端代码

确保你的后端代码已经：
- ✅ 配置了正确的端口（8082 或其他可用端口）
- ✅ 配置了 CORS（允许 Vercel 域名）
- ✅ 实现了 `/health` 健康检查端点
- ✅ API 路由以 `/api/` 开头

### 步骤 2: 上传代码到服务器

```bash
# 方式 1: 使用 Git
ssh root@162.14.83.58
cd /var/www
git clone <your-repo-url> new-service
cd new-service
npm install  # 或 pnpm install / pip install -r requirements.txt

# 方式 2: 使用 SCP
scp -r ./new-service root@162.14.83.58:/var/www/
```

### 步骤 3: 配置环境变量

```bash
ssh root@162.14.83.58
cd /var/www/new-service

# 创建 .env 文件
cat > .env << EOF
PORT=8082
NODE_ENV=production
FRONTEND_URL=https://frontend-ary348pbe-xiaodingyangs-projects.vercel.app
# 其他环境变量...
EOF
```

### 步骤 4: 使用 PM2 启动服务

```bash
# 启动服务
pm2 start index.js --name new-service -i 1 -- --port 8082

# 查看状态
pm2 status

# 查看日志
pm2 logs new-service

# 保存配置（开机自启）
pm2 save
```

### 步骤 5: 测试服务（内网）

```bash
# 测试健康检查
curl http://localhost:8082/health

# 测试 API 端点
curl http://localhost:8082/api/your-endpoint
```

### 步骤 6: 配置 Nginx 反向代理

#### 方式 A: 快速添加（临时方案）

```bash
# 编辑 Nginx 配置
vim /etc/nginx/conf.d/myblog.conf

# 在 server 块中添加以下内容（在其他 location 之前）
```

```nginx
# 新服务 API（临时配置）
location /api/v1/new-service/ {
    # 移除前缀，转发到后端的 /api/
    rewrite ^/api/v1/new-service/(.*)$ /api/$1 break;

    proxy_pass http://127.0.0.1:8082;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;

    proxy_read_timeout 60s;
    proxy_connect_timeout 10s;

    # CORS 配置（复制现有的）
    add_header Access-Control-Allow-Origin "https://frontend-ary348pbe-xiaodingyangs-projects.vercel.app" always;
    add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
    add_header Access-Control-Allow-Headers "Content-Type, Authorization, X-Requested-With" always;
    add_header Access-Control-Allow-Credentials "true" always;

    if ($request_method = OPTIONS) {
        return 204;
    }
}
```

```bash
# 测试配置
nginx -t

# 重载 Nginx
systemctl reload nginx
```

#### 方式 B: 使用优化配置（推荐，但需要重构）

如果你已经有 3 个或更多后端服务，建议使用优化后的配置：

```bash
# 1. 阅读扩展性分析文档
cat /path/to/docs/scalability-analysis.md

# 2. 使用自动化迁移脚本
/path/to/scripts/migrate-nginx-config.sh

# 3. 按照模板添加新服务
# 详见 migration-guide.md
```

### 步骤 7: 测试外网访问

```bash
# 测试健康检查
curl https://www.xiaodingyang.art/api/v1/new-service/health

# 测试 API 端点
curl https://www.xiaodingyang.art/api/v1/new-service/your-endpoint

# 测试 CORS（从本地）
curl -H "Origin: https://frontend-ary348pbe-xiaodingyangs-projects.vercel.app" \
     -H "Access-Control-Request-Method: GET" \
     -X OPTIONS \
     https://www.xiaodingyang.art/api/v1/new-service/your-endpoint
```

---

## 📋 部署检查清单

### 部署前
- [ ] 确认端口号（8082 或其他可用端口）
- [ ] 确认 API 路径规范（`/api/v1/{service-name}/`）
- [ ] 实现健康检查端点（`/health`）
- [ ] 配置 CORS（允许 Vercel 域名）
- [ ] 准备环境变量文件（`.env.production`）

### 部署中
- [ ] 上传代码到服务器
- [ ] 安装依赖
- [ ] 配置环境变量
- [ ] 使用 PM2 启动服务
- [ ] 测试内网访问（`curl localhost:8082/health`）
- [ ] 配置 Nginx 反向代理
- [ ] 测试 Nginx 配置（`nginx -t`）
- [ ] 重载 Nginx（`systemctl reload nginx`）

### 部署后
- [ ] 测试外网访问（`curl https://www.xiaodingyang.art/api/v1/...`）
- [ ] 测试 CORS 跨域
- [ ] 查看 PM2 日志（`pm2 logs`）
- [ ] 查看 Nginx 日志（`tail -f /var/log/nginx/error.log`）
- [ ] 保存 PM2 配置（`pm2 save`）
- [ ] 更新 API 文档

---

## 🔍 常见问题排查

### 问题 1: 外网无法访问（404）

**可能原因**:
1. Nginx 配置错误
2. 端口未在 Nginx 中配置
3. rewrite 规则错误

**排查步骤**:
```bash
# 1. 检查 Nginx 配置
nginx -t

# 2. 查看 Nginx 错误日志
tail -f /var/log/nginx/error.log

# 3. 测试内网访问
curl http://localhost:8082/health

# 4. 检查 Nginx 配置中是否有对应的 location
grep -A 10 "location /api/v1/new-service" /etc/nginx/conf.d/myblog.conf
```

### 问题 2: CORS 错误

**可能原因**:
1. 后端 CORS 配置错误
2. Nginx CORS 头配置错误
3. 域名不在白名单中

**排查步骤**:
```bash
# 1. 测试 OPTIONS 预检请求
curl -H "Origin: https://your-vercel-domain.vercel.app" \
     -H "Access-Control-Request-Method: GET" \
     -X OPTIONS \
     -I \
     https://www.xiaodingyang.art/api/v1/new-service/health

# 2. 检查响应头中是否包含 Access-Control-Allow-Origin

# 3. 检查后端 CORS 配置
cat /var/www/new-service/.env | grep FRONTEND_URL
```

### 问题 3: 服务启动失败

**可能原因**:
1. 端口被占用
2. 环境变量缺失
3. 依赖未安装

**排查步骤**:
```bash
# 1. 检查端口占用
ss -tlnp | grep 8082

# 2. 查看 PM2 日志
pm2 logs new-service --lines 50

# 3. 检查环境变量
pm2 env 0  # 0 是进程 ID

# 4. 手动启动测试
cd /var/www/new-service
node index.js  # 或 python app.py
```

### 问题 4: 502 Bad Gateway

**可能原因**:
1. 后端服务未启动
2. 后端服务崩溃
3. Nginx 代理配置错误

**排查步骤**:
```bash
# 1. 检查后端服务状态
pm2 status

# 2. 测试后端服务
curl http://localhost:8082/health

# 3. 查看 Nginx 错误日志
tail -f /var/log/nginx/error.log

# 4. 重启后端服务
pm2 restart new-service
```

---

## 📚 相关文档

### 必读文档
- **scalability-analysis.md** - 扩展性分析（了解为什么要遵循这些规范）
- **migration-guide.md** - 迁移指南（如何使用优化后的配置）

### 参考文档
- **nginx-scalable-config.conf** - 优化后的 Nginx 配置模板
- **deployment-summary.md** - 当前部署状态总结

### 工具脚本
- **migrate-nginx-config.sh** - 自动化迁移脚本（3 个服务以上推荐使用）

---

## 🎯 最佳实践建议

### 1. 服务命名规范

```
✅ 推荐：短横线分隔，小写
- user-service
- payment-service
- analytics-service

❌ 避免：驼峰命名、下划线
- userService
- user_service
```

### 2. 环境变量管理

```bash
# 使用 .env 文件管理环境变量
# 不要在代码中硬编码配置

# 开发环境
.env.development

# 生产环境
.env.production

# 敏感信息不要提交到 Git
echo ".env*" >> .gitignore
```

### 3. 日志管理

```javascript
// 使用日志库（如 winston, pino）
const logger = require('./logger');

logger.info('Server started', { port: PORT });
logger.error('Database connection failed', { error: err.message });
```

### 4. 错误处理

```javascript
// 统一错误处理中间件
app.use((err, req, res, next) => {
  logger.error('Unhandled error', { error: err.message, stack: err.stack });
  res.status(500).json({
    code: 500,
    message: 'Internal server error',
  });
});
```

### 5. 监控和告警

```bash
# 使用 PM2 监控
pm2 monit

# 查看资源使用
pm2 status

# 设置内存限制（防止内存泄漏）
pm2 start index.js --name new-service --max-memory-restart 500M
```

---

## 🚨 安全注意事项

### 1. 环境变量安全

```bash
# .env 文件权限设置
chmod 600 .env

# 不要在日志中打印敏感信息
# ❌ console.log('DB_PASSWORD:', process.env.DB_PASSWORD)
# ✅ logger.info('Database connected')
```

### 2. API 安全

```javascript
// 使用 helmet 增强安全性
const helmet = require('helmet');
app.use(helmet());

// 限流（防止 DDoS）
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 分钟
  max: 100 // 限制 100 次请求
});
app.use('/api/', limiter);

// 输入验证
const { body, validationResult } = require('express-validator');
app.post('/api/user', [
  body('email').isEmail(),
  body('password').isLength({ min: 6 })
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  // ...
});
```

### 3. HTTPS 强制

```nginx
# Nginx 配置中已包含 HTTP → HTTPS 重定向
# 确保所有 API 请求都使用 HTTPS
```

---

## 📞 获取帮助

### 查看日志
```bash
# PM2 日志
pm2 logs new-service

# Nginx 错误日志
tail -f /var/log/nginx/error.log

# Nginx 访问日志
tail -f /var/log/nginx/access.log
```

### 测试工具
```bash
# 测试 API
curl https://www.xiaodingyang.art/api/v1/new-service/health

# 测试 CORS
curl -H "Origin: https://your-domain.vercel.app" \
     -X OPTIONS \
     -I \
     https://www.xiaodingyang.art/api/v1/new-service/health

# 测试性能
ab -n 1000 -c 10 https://www.xiaodingyang.art/api/v1/new-service/health
```

---

## 📝 部署后更新文档

部署完成后，请更新以下文档：

1. **deployment-summary.md** - 添加新服务信息
2. **API 文档** - 记录新服务的 API 端点
3. **README.md** - 更新项目架构图

---

*文档生成时间: 2026-04-13*
*版本: v1.0*
*维护者: 请在部署新服务后更新本文档*
