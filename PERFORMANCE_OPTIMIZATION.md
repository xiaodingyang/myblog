# 线上性能优化建议

## 当前问题
- 本地 LCP: 2.4s ✅
- 线上 LCP: 6.7s ❌
- 差距原因：网络传输慢、JS 文件大

## 立即可做的优化

### 1. 启用 Gzip/Brotli 压缩（最有效）
在 Nginx 配置中已有 gzip，确保启用：
```nginx
gzip on;
gzip_types text/plain text/css application/json application/javascript;
gzip_min_length 1024;
```

### 2. 使用 CDN 加速静态资源
推荐方案：
- 阿里云 OSS + CDN
- 腾讯云 COS + CDN
- Cloudflare（免费）

配置方法：
```bash
# 构建时设置 publicPath
UMI_ENV=production PUBLIC_PATH=https://cdn.yourdomain.com/ npm run build
```

### 3. 服务器升级带宽
- 当前可能是 1Mbps
- 建议升级到 5Mbps 或更高

## 代码优化（已完成）
- ✅ 首屏标题改用原生 h1
- ✅ 关键 CSS 内联
- ✅ DNS 预连接
- ✅ React 单独分包

## 预期效果
- 启用 CDN：LCP 降至 3-4s
- 升级带宽：LCP 降至 2-3s
- 两者结合：LCP 降至 2s 以内
