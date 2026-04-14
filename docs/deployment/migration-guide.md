# Nginx 配置迁移指南

## 快速开始

### 方式 1: 使用自动化脚本（推荐）

```bash
# 1. 上传脚本到服务器
scp scripts/migrate-nginx-config.sh root@162.14.83.58:/tmp/

# 2. SSH 连接服务器
ssh root@162.14.83.58

# 3. 添加执行权限
chmod +x /tmp/migrate-nginx-config.sh

# 4. 执行迁移
/tmp/migrate-nginx-config.sh
```

**脚本功能**:
- ✅ 自动备份当前配置
- ✅ 生成新配置文件
- ✅ 测试配置语法
- ✅ 自动重载 Nginx
- ✅ 验证服务可用性
- ✅ 失败自动回滚

---

### 方式 2: 手动迁移

```bash
# 1. 备份当前配置
ssh root@162.14.83.58 "cp /etc/nginx/conf.d/myblog.conf /etc/nginx/conf.d/myblog.conf.bak.manual"

# 2. 上传新配置
scp docs/nginx-scalable-config.conf root@162.14.83.58:/etc/nginx/conf.d/myblog.conf

# 3. 测试配置
ssh root@162.14.83.58 "nginx -t"

# 4. 重载 Nginx
ssh root@162.14.83.58 "systemctl reload nginx"

# 5. 验证服务
curl https://www.xiaodingyang.art/vercel-api/health
curl https://www.xiaodingyang.art/api/v2/blog/health
```

---

## 迁移后验证

### 1. 测试旧路径（向后兼容）

```bash
# 测试旧的 /vercel-api/ 路径
curl https://www.xiaodingyang.art/vercel-api/articles?page=1&pageSize=1

# 预期结果: 正常返回文章数据
```

### 2. 测试新路径（推荐使用）

```bash
# 测试新的 /api/v2/blog/ 路径
curl https://www.xiaodingyang.art/api/v2/blog/articles?page=1&pageSize=1

# 预期结果: 正常返回文章数据
```

### 3. 测试 CORS（跨域）

```bash
# 测试 Vercel 域名跨域
curl -H "Origin: https://frontend-ary348pbe-xiaodingyangs-projects.vercel.app" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS \
     https://www.xiaodingyang.art/api/v2/blog/articles

# 预期结果: 返回 204，包含 Access-Control-Allow-Origin 头
```

---

## 更新前端配置

### Vercel 环境变量

**当前配置**（兼容模式）:
```env
API_BASE_URL=https://www.xiaodingyang.art/vercel-api
```

**推荐配置**（新路径）:
```env
API_BASE_URL=https://www.xiaodingyang.art/api/v2/blog
```

**更新步骤**:
```bash
# 1. 修改 frontend/.env.production
cd myblog/frontend
echo "API_BASE_URL=https://www.xiaodingyang.art/api/v2/blog" > .env.production

# 2. 重新部署到 Vercel
vercel --prod

# 3. 测试前端功能
# 打开浏览器访问 Vercel 域名，检查 API 请求是否正常
```

---

## 新增服务示例

### 场景: 新增用户服务（端口 8082）

**步骤 1: 编辑 Nginx 配置**
```bash
ssh root@162.14.83.58
vim /etc/nginx/conf.d/myblog.conf
```

**步骤 2: 添加 upstream**（在文件开头，map 指令之后）
```nginx
upstream user_service {
    server 127.0.0.1:8082 max_fails=3 fail_timeout=30s;
    keepalive 32;
}
```

**步骤 3: 添加 location**（在 server 块中）
```nginx
# 用户服务 API v1
location /api/v1/user/ {
    rewrite ^/api/v1/user/(.*)$ /api/$1 break;

    proxy_pass http://user_service;
    proxy_http_version 1.1;
    proxy_set_header Connection "";
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;

    proxy_read_timeout 60s;
    proxy_connect_timeout 10s;

    add_header Access-Control-Allow-Origin $cors_origin always;
    add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
    add_header Access-Control-Allow-Headers "Content-Type, Authorization, X-Requested-With" always;
    add_header Access-Control-Allow-Credentials "true" always;

    if ($request_method = OPTIONS) {
        return 204;
    }
}
```

**步骤 4: 测试并重载**
```bash
nginx -t
systemctl reload nginx
```

**步骤 5: 启动服务**
```bash
cd /var/www/user-service
pm2 start index.js --name user-service -i 1 -- --port 8082
pm2 save
```

**步骤 6: 测试**
```bash
curl https://www.xiaodingyang.art/api/v1/user/profile
```

---

## 回滚方案

### 如果迁移后出现问题

```bash
# 方式 1: 使用自动备份回滚
ssh root@162.14.83.58
cp /etc/nginx/backups/myblog.conf.backup.* /etc/nginx/conf.d/myblog.conf
nginx -t
systemctl reload nginx

# 方式 2: 使用手动备份回滚
ssh root@162.14.83.58
cp /etc/nginx/conf.d/myblog.conf.bak.before-refactor /etc/nginx/conf.d/myblog.conf
nginx -t
systemctl reload nginx
```

---

## 常见问题

### Q1: 迁移后旧路径无法访问？
**A**: 检查 upstream 配置中的端口是否正确
```bash
# 查看后端服务监听端口
ss -tlnp | grep -E '3000|8081'

# 查看 PM2 进程
pm2 status
```

### Q2: CORS 错误？
**A**: 检查 map 配置中是否包含你的域名
```bash
# 查看 Nginx 配置
grep -A 5 "map \$http_origin" /etc/nginx/conf.d/myblog.conf

# 测试 CORS
curl -H "Origin: https://your-domain.vercel.app" \
     -I https://www.xiaodingyang.art/api/v2/blog/health
```

### Q3: 新路径 404？
**A**: 检查 rewrite 规则和 proxy_pass 配置
```bash
# 查看 Nginx 错误日志
tail -f /var/log/nginx/error.log

# 查看访问日志
tail -f /var/log/nginx/access.log | grep "api/v2"
```

---

## 监控建议

### 1. 设置日志监控
```bash
# 实时监控错误日志
tail -f /var/log/nginx/error.log

# 监控 API 访问
tail -f /var/log/nginx/access.log | grep -E "api/v2|vercel-api"
```

### 2. 监控旧路径访问量
```bash
# 统计旧路径访问次数
grep "vercel-api" /var/log/nginx/access.log | wc -l

# 统计新路径访问次数
grep "api/v2/blog" /var/log/nginx/access.log | wc -l
```

### 3. 设置告警（可选）
```bash
# 使用 logwatch 或 fail2ban 监控异常
# 当 5xx 错误超过阈值时发送邮件告警
```

---

## 性能优化建议

### 1. 启用 HTTP/2
```nginx
listen 443 ssl http2;  # 已启用
```

### 2. 调整 keepalive 连接数
```nginx
upstream blog_backend_v2 {
    server 127.0.0.1:8081 max_fails=3 fail_timeout=30s;
    keepalive 64;  # 根据并发量调整（默认 32）
}
```

### 3. 启用缓存（可选）
```nginx
# 在 http 块中添加
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=api_cache:10m max_size=1g inactive=60m;

# 在 location 中使用
location /api/v2/blog/articles {
    proxy_cache api_cache;
    proxy_cache_valid 200 5m;
    proxy_cache_key "$scheme$request_method$host$request_uri";
    # ... 其他配置
}
```

---

## 文档更新清单

迁移完成后，请更新以下文档:

- [ ] API 文档（更新为新路径）
- [ ] 前端 README（更新环境变量说明）
- [ ] 部署文档（更新 Nginx 配置说明）
- [ ] 团队 Wiki（通知新的 API 路径规范）

---

## 联系支持

如有问题，请查看:
- [扩展性分析文档](./scalability-analysis.md)
- [Nginx 配置模板](./nginx-scalable-config.conf)
- [部署总结文档](./deployment-summary.md)

---

*文档生成时间: 2026-04-13*
*版本: v1.0*
