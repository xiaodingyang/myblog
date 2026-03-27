# Nginx 缓存配置说明

## 1. 在主配置文件 /etc/nginx/nginx.conf 的 http 块中添加：

```nginx
http {
    # ... 其他配置 ...

    # 定义缓存路径
    proxy_cache_path /var/cache/nginx/blog
        levels=1:2
        keys_zone=blog_cache:10m
        max_size=100m
        inactive=60m
        use_temp_path=off;

    # ... 其他配置 ...
}
```

## 2. 创建缓存目录并设置权限：

```bash
sudo mkdir -p /var/cache/nginx/blog
sudo chown -R nginx:nginx /var/cache/nginx/blog
sudo chmod -R 755 /var/cache/nginx/blog
```

## 3. 启用缓存

在 nginx.conf 中取消注释这些行（已添加但被注释）：

```nginx
proxy_cache blog_cache;
proxy_cache_valid 200 10m;
proxy_cache_key "$request_uri$is_args$args";
proxy_cache_bypass $http_cache_control;
add_header X-Cache-Status $upstream_cache_status;
```

## 4. 重启 Nginx

```bash
sudo nginx -t  # 测试配置
sudo systemctl reload nginx  # 重载配置
```

## 效果

- 首页 API 请求（/api/articles、/api/categories、/api/tags）缓存 10 分钟
- 10 分钟内的重复请求直接返回缓存，不调用后端
- 响应头会显示 `X-Cache-Status: HIT`（命中）或 `MISS`（未命中）

## 成本

- 几乎为 0（只有缓存过期时才请求后端）
- 1000 PV/天 → 每 10 分钟 1 次请求 → 每天 144 次 → 月 4,320 次
