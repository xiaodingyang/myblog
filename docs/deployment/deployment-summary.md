# 博客部署完成总结

## 部署架构

```
┌─────────────────────────────────────────────────────────────┐
│                         用户浏览器                            │
└─────────────────────────────────────────────────────────────┘
                              │
                              ├─────────────────────────────────┐
                              │                                 │
                              ▼                                 ▼
                    ┌──────────────────┐            ┌──────────────────┐
                    │  Vercel CDN      │            │  腾讯云服务器      │
                    │  (前端静态资源)   │            │  (后端 API)       │
                    └──────────────────┘            └──────────────────┘
                              │                                 │
                              │                                 │
                    前端 React SPA                    Express + MongoDB
                    Umi 4 框架                        PM2 进程管理
                                                      Nginx 反向代理
```

## 部署信息

### 前端部署（Vercel）
- **生产域名**: https://frontend-ary348pbe-xiaodingyangs-projects.vercel.app
- **备用域名**: https://frontend-nu-woad-82.vercel.app
- **部署平台**: Vercel
- **构建工具**: pnpm + Umi 4
- **部署时间**: 2026-04-13 10:13 (UTC+8)
- **构建时长**: 约 2 分钟
- **资源大小**: 
  - vendors.js: 1.25 MB (gzip)
  - antd.js: 242.62 KB (gzip)
  - particles.async.js: 244.54 KB (gzip)

### 后端部署（腾讯云服务器）
- **服务器 IP**: 162.14.83.58
- **API 域名**: https://www.xiaodingyang.art/vercel-api
- **直接访问**: http://162.14.83.58:8081 (仅内网)
- **进程管理**: PM2 (cluster 模式)
- **反向代理**: Nginx 1.26.3
- **数据库**: MongoDB (本地)
- **部署时间**: 2026-04-13 10:04 (UTC+8)

## 配置文件清单

### 1. 前端配置
- `frontend/.env.production` - 生产环境变量
  ```env
  API_BASE_URL=https://www.xiaodingyang.art/vercel-api
  ```

- `frontend/.umirc.ts` - Umi 配置
  - 添加了 `define` 配置注入环境变量
  - 开发环境保留 proxy 配置

- `vercel.json` - Vercel 部署配置
  - 构建命令: `cd frontend && pnpm install && pnpm build`
  - 输出目录: `frontend/dist`
  - SPA 路由重写规则

### 2. 后端配置
- `backend/.env` (服务器) - 生产环境变量
  ```env
  PORT=8081
  NODE_ENV=production
  MONGODB_URI=mongodb://localhost:27017/blog
  JWT_SECRET=xdy-blog-jwt-secret-2026
  FRONTEND_URL=https://frontend-ary348pbe-xiaodingyangs-projects.vercel.app
  ```

- `backend/ecosystem.config.js` - PM2 配置
  - 进程名: blog-backend
  - 运行模式: cluster (1 实例)
  - 日志路径: `./logs/`
  - 自动重启: 启用

- `backend/src/index.js` - CORS 配置
  - 允许的域名: 从环境变量 `FRONTEND_URL` 读取
  - 支持多域名（逗号分隔）
  - 启用 credentials

### 3. Nginx 配置
- `/etc/nginx/conf.d/myblog.conf` (服务器)
  - 新增 `/vercel-api/` location
  - 代理到 `http://127.0.0.1:8081/api/`
  - CORS 头配置:
    - Access-Control-Allow-Origin: Vercel 域名
    - Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
    - Access-Control-Allow-Credentials: true

## API 测试结果

### 健康检查
```bash
curl https://www.xiaodingyang.art/vercel-api/health
# 响应: {"status":"ok","timestamp":"2026-04-13T02:04:44.652Z"}
```

### 文章列表
```bash
curl https://www.xiaodingyang.art/vercel-api/articles?page=1&pageSize=1
# 响应: {"code":0,"message":"success","data":{"list":[...],"total":40}}
```

### 分类列表
```bash
curl https://www.xiaodingyang.art/vercel-api/categories
# 响应: 5 个分类（性能优化、SEO、开源项目、前端开发、后端开发）
```

### 标签列表
```bash
curl https://www.xiaodingyang.art/vercel-api/tags
# 响应: 多个标签（React.js、JavaScript、Webpack 等）
```

## 部署步骤回顾

### 阶段 1: 前端配置
1. ✅ 创建 `vercel.json` 配置文件
2. ✅ 修改 `.umirc.ts` 添加环境变量支持
3. ✅ 创建 `.env.production` 配置生产环境 API 地址
4. ✅ 本地构建测试通过

### 阶段 2: 后端配置
1. ✅ 创建 `ecosystem.config.js` PM2 配置
2. ✅ 修改 `src/index.js` 更新 CORS 配置
3. ✅ 创建 `.env.production` 模板

### 阶段 3: Vercel 部署
1. ✅ 安装 Vercel CLI: `npm install -g vercel`
2. ✅ 登录 Vercel 账号
3. ✅ 首次部署: `vercel --prod`
4. ✅ 更新环境变量后重新部署

### 阶段 4: 服务器部署
1. ✅ SSH 连接服务器
2. ✅ 上传配置文件到 `/var/www/myblog/backend/`
3. ✅ 更新 `.env` 环境变量
4. ✅ PM2 启动服务: `pm2 start ecosystem.config.js --env production`
5. ✅ 保存 PM2 配置: `pm2 save`
6. ✅ 设置开机自启: `pm2 startup`

### 阶段 5: Nginx 配置
1. ✅ 备份原配置: `myblog.conf.bak.20260413021306`
2. ✅ 添加 `/vercel-api/` location 配置
3. ✅ 配置 CORS 头支持跨域
4. ✅ 测试配置: `nginx -t`
5. ✅ 重载 Nginx: `systemctl reload nginx`
6. ✅ 更新 CORS 允许的域名为最新 Vercel 域名

### 阶段 6: 验证测试
1. ✅ 后端健康检查通过
2. ✅ 文章列表 API 测试通过
3. ✅ 分类/标签 API 测试通过
4. ✅ CORS 跨域请求测试通过

## 遇到的问题及解决方案

### 问题 1: Vercel 部署失败 - framework 不在允许列表
**错误信息**: `framework 'umijs' is not in the allowed list`

**原因**: Vercel 自动检测到 monorepo 结构，添加了 `experimentalServices` 配置，但 `framework: "umijs"` 不在允许列表中。

**解决方案**: 删除 `experimentalServices` 配置，简化为单一前端部署配置。

### 问题 2: 外网无法访问 8081 端口
**原因**: 
1. 服务器防火墙（firewalld）未运行
2. 云服务商安全组未开放 8081 端口

**解决方案**: 使用 Nginx 反向代理，通过已开放的 443 端口（HTTPS）提供 API 服务。

### 问题 3: 本地网络无法访问 Vercel 域名
**原因**: 本地网络环境限制（可能是防火墙或 DNS 问题）

**影响**: 无法直接在本地浏览器测试前端页面

**验证方法**: 
- Vercel 部署状态显示 "Ready"
- API 接口测试全部通过
- 可以使用手机热点或其他网络环境访问

## 后续优化建议

### 1. 图片存储优化
**当前方案**: 图片存储在服务器本地 `/var/www/myblog/backend/uploads/`

**优化方案**: 迁移到对象存储（腾讯云 COS 或阿里云 OSS）
- 减轻服务器存储压力
- 提升图片加载速度（CDN 加速）
- 降低服务器带宽成本

### 2. 自定义域名
**当前**: 使用 Vercel 默认域名（较长）

**优化**: 配置自定义域名（如 `blog.xiaodingyang.art`）
- 更简洁易记
- 提升品牌形象
- 配置步骤: Vercel 控制台 → Domains → Add Domain

### 3. SSG 静态生成
**当前**: CSR（客户端渲染）

**优化**: 启用 SSG（静态站点生成）
- 提升首屏加载速度
- 改善 SEO 效果
- 减少服务器压力
- 配置: `.umirc.ts` 中启用 `ssr` 和 `exportStatic`

### 4. 监控告警
**建议**: 
- 配置 PM2 Plus 监控（进程状态、内存、CPU）
- 配置 Sentry 错误追踪（前后端）
- 配置 Nginx 访问日志分析（GoAccess）
- 配置服务器资源监控（Prometheus + Grafana）

### 5. 备份策略
**建议**:
- MongoDB 定期备份（每日凌晨）
- 上传文件定期备份到对象存储
- 配置文件版本控制（Git）

### 6. 性能优化
**前端**:
- 启用 Vercel Edge Functions（边缘计算）
- 配置 Service Worker（离线缓存）
- 优化图片格式（WebP）

**后端**:
- 启用 Redis 缓存（热点数据）
- 数据库索引优化
- API 响应压缩（gzip/brotli）

## 访问地址

### 生产环境
- **前端**: https://frontend-ary348pbe-xiaodingyangs-projects.vercel.app
- **后端 API**: https://www.xiaodingyang.art/vercel-api
- **管理后台**: https://frontend-ary348pbe-xiaodingyangs-projects.vercel.app/admin

### 测试命令
```bash
# 测试前端
curl https://frontend-ary348pbe-xiaodingyangs-projects.vercel.app

# 测试后端健康检查
curl https://www.xiaodingyang.art/vercel-api/health

# 测试文章列表
curl https://www.xiaodingyang.art/vercel-api/articles?page=1&pageSize=5

# 测试分类列表
curl https://www.xiaodingyang.art/vercel-api/categories

# 测试标签列表
curl https://www.xiaodingyang.art/vercel-api/tags
```

## 服务器管理命令

### PM2 进程管理
```bash
# 查看进程状态
pm2 status

# 查看日志
pm2 logs blog-backend

# 重启服务
pm2 restart blog-backend

# 停止服务
pm2 stop blog-backend

# 删除进程
pm2 delete blog-backend

# 监控面板
pm2 monit
```

### Nginx 管理
```bash
# 测试配置
nginx -t

# 重载配置
systemctl reload nginx

# 重启 Nginx
systemctl restart nginx

# 查看日志
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

### MongoDB 管理
```bash
# 连接数据库
mongosh

# 查看数据库
show dbs

# 使用博客数据库
use blog

# 查看集合
show collections

# 备份数据库
mongodump --db blog --out /backup/mongodb/$(date +%Y%m%d)

# 恢复数据库
mongorestore --db blog /backup/mongodb/20260413/blog
```

## 部署完成时间
- **开始时间**: 2026-04-13 09:30 (UTC+8)
- **完成时间**: 2026-04-13 10:20 (UTC+8)
- **总耗时**: 约 50 分钟

## 部署状态
✅ **部署成功** - 前后端已成功分离部署，API 接口测试全部通过。

---

*文档生成时间: 2026-04-13 10:20*
*部署工程师: Claude (AI Assistant)*
