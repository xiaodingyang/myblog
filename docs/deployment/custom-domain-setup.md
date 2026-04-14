# 自定义域名配置指南

## 📌 域名信息

- **新域名**: blog.ruofeng.com
- **用途**: 博客前端（Vercel）
- **配置时间**: 2026-04-13

---

## ✅ 已完成步骤

### 1. Vercel 域名添加 ✅

```bash
vercel domains add blog.ruofeng.com
```

**结果**: 域名已成功添加到 Vercel 项目

---

## 🔧 待完成步骤

### 2. 配置 Cloudflare DNS

**登录地址**: https://dash.cloudflare.com

**操作步骤**:
1. 选择域名 `ruofeng.com`
2. 进入 **DNS** 设置
3. 点击 **Add record**
4. 添加以下记录：

```
类型: A
名称: blog
IPv4 地址: 76.76.21.21
代理状态: DNS only（灰色云朵，关闭代理）
TTL: Auto
```

**重要**: 
- ⚠️ 必须关闭 Cloudflare 代理（灰色云朵），否则 Vercel SSL 证书无法验证
- ⚠️ 配置后等待 DNS 生效（通常 5-10 分钟）

---

### 3. 更新后端 CORS 配置

**文件**: `backend/.env` (服务器上)

**修改**:
```bash
# SSH 连接服务器
ssh root@162.14.83.58

# 编辑环境变量
vim /var/www/myblog/backend/.env

# 修改 FRONTEND_URL（添加新域名）
FRONTEND_URL=https://blog.ruofeng.com,https://frontend-ary348pbe-xiaodingyangs-projects.vercel.app
```

**重启后端服务**:
```bash
pm2 restart blog-backend
```

---

### 4. 更新 Nginx CORS 配置

**文件**: `/etc/nginx/conf.d/myblog.conf` (服务器上)

**修改**:
```bash
# SSH 连接服务器
ssh root@162.14.83.58

# 备份配置
cp /etc/nginx/conf.d/myblog.conf /etc/nginx/conf.d/myblog.conf.bak.$(date +%Y%m%d%H%M%S)

# 编辑配置
vim /etc/nginx/conf.d/myblog.conf
```

**找到 CORS 配置部分**:
```nginx
# 修改前
add_header Access-Control-Allow-Origin "https://frontend-ary348pbe-xiaodingyangs-projects.vercel.app" always;

# 修改后（添加新域名）
add_header Access-Control-Allow-Origin "https://blog.ruofeng.com" always;
```

**测试并重载**:
```bash
nginx -t
systemctl reload nginx
```

---

### 5. 更新前端环境变量（可选）

**文件**: `frontend/.env.production`

**修改**:
```env
# 保持不变，API 地址不需要修改
API_BASE_URL=https://www.xiaodingyang.art/vercel-api
```

**重新部署**（如果需要）:
```bash
cd frontend
vercel --prod
```

---

## 🧪 验证步骤

### 1. 检查 DNS 解析

```bash
# 等待 DNS 生效（5-10 分钟后）
nslookup blog.ruofeng.com

# 预期结果
# Server:  ...
# Address: ...
# 
# Name:    blog.ruofeng.com
# Address: 76.76.21.21
```

### 2. 检查 Vercel 域名状态

```bash
cd frontend
vercel domains ls

# 预期结果
# blog.ruofeng.com    ✓ Valid
```

### 3. 测试 HTTPS 访问

```bash
# 等待 SSL 证书配置完成（可能需要几分钟）
curl -I https://blog.ruofeng.com

# 预期结果
# HTTP/2 200
# server: Vercel
```

### 4. 测试前端页面

在浏览器中访问: https://blog.ruofeng.com

**检查项**:
- ✅ 页面正常加载
- ✅ HTTPS 证书有效（绿色锁）
- ✅ API 请求正常（检查浏览器控制台）

### 5. 测试 CORS

```bash
# 测试跨域请求
curl -H "Origin: https://blog.ruofeng.com" \
     -H "Access-Control-Request-Method: GET" \
     -X OPTIONS \
     https://www.xiaodingyang.art/vercel-api/health

# 预期结果
# HTTP/1.1 204 No Content
# Access-Control-Allow-Origin: https://blog.ruofeng.com
```

---

## 📊 域名对照表

| 用途 | 域名 | 指向 |
|------|------|------|
| 博客前端（新） | https://blog.ruofeng.com | Vercel |
| 博客前端（旧） | https://frontend-ary348pbe-xiaodingyangs-projects.vercel.app | Vercel |
| 后端 API | https://www.xiaodingyang.art/vercel-api | 腾讯云服务器 |
| 主站 | https://www.xiaodingyang.art | 腾讯云服务器 |

---

## ⚠️ 常见问题

### Q1: DNS 配置后域名无法访问

**原因**: DNS 未生效或配置错误

**解决方案**:
```bash
# 1. 检查 DNS 解析
nslookup blog.ruofeng.com

# 2. 检查 Cloudflare 代理状态（必须是灰色云朵）

# 3. 等待 DNS 传播（最多 24 小时，通常 5-10 分钟）
```

### Q2: SSL 证书错误

**原因**: Vercel 正在配置证书，或 Cloudflare 代理未关闭

**解决方案**:
```bash
# 1. 确认 Cloudflare 代理已关闭（灰色云朵）

# 2. 等待 Vercel 自动配置 SSL（通常 5-10 分钟）

# 3. 检查 Vercel 控制台的域名状态
```

### Q3: API 请求 CORS 错误

**原因**: 后端 CORS 配置未更新

**解决方案**:
```bash
# 1. 检查后端环境变量
ssh root@162.14.83.58
cat /var/www/myblog/backend/.env | grep FRONTEND_URL

# 2. 检查 Nginx CORS 配置
grep "Access-Control-Allow-Origin" /etc/nginx/conf.d/myblog.conf

# 3. 重启服务
pm2 restart blog-backend
systemctl reload nginx
```

---

## 🎯 配置完成后

### 更新文档

1. 更新 `docs/deployment/deployment-summary.md`
2. 更新 `PROJECT_STRUCTURE.md`
3. 更新 `README.md`

### 通知用户

- 新域名: https://blog.ruofeng.com
- 旧域名仍然可用（作为备用）

---

## 📞 技术支持

如有问题，请检查:
1. Cloudflare DNS 设置
2. Vercel 域名状态: `vercel domains ls`
3. Nginx 错误日志: `tail -f /var/log/nginx/error.log`
4. 后端日志: `pm2 logs blog-backend`

---

*配置时间: 2026-04-13*
*域名: blog.ruofeng.com*
*状态: 待 DNS 配置*
