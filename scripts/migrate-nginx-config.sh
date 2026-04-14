#!/bin/bash

# ============================================
# Nginx 配置优化迁移脚本
# ============================================
# 功能: 将当前 Nginx 配置升级为可扩展架构
# 作者: Claude AI Assistant
# 日期: 2026-04-13
# ============================================

set -e  # 遇到错误立即退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 配置变量
NGINX_CONF_DIR="/etc/nginx/conf.d"
NGINX_CONF_FILE="$NGINX_CONF_DIR/myblog.conf"
BACKUP_DIR="/etc/nginx/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/myblog.conf.backup.$TIMESTAMP"

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查是否为 root 用户
check_root() {
    if [ "$EUID" -ne 0 ]; then
        log_error "请使用 root 用户运行此脚本"
        exit 1
    fi
}

# 检查 Nginx 是否安装
check_nginx() {
    if ! command -v nginx &> /dev/null; then
        log_error "Nginx 未安装"
        exit 1
    fi
    log_success "Nginx 已安装: $(nginx -v 2>&1)"
}

# 创建备份目录
create_backup_dir() {
    if [ ! -d "$BACKUP_DIR" ]; then
        mkdir -p "$BACKUP_DIR"
        log_info "创建备份目录: $BACKUP_DIR"
    fi
}

# 备份当前配置
backup_config() {
    if [ -f "$NGINX_CONF_FILE" ]; then
        cp "$NGINX_CONF_FILE" "$BACKUP_FILE"
        log_success "配置已备份到: $BACKUP_FILE"
    else
        log_error "配置文件不存在: $NGINX_CONF_FILE"
        exit 1
    fi
}

# 生成新配置
generate_new_config() {
    log_info "生成新配置文件..."

    cat > "$NGINX_CONF_FILE.new" << 'EOF'
# ============================================
# 可扩展的 Nginx 配置
# 生成时间: TIMESTAMP_PLACEHOLDER
# ============================================

# CORS 白名单映射
map $http_origin $cors_origin {
    default "";
    "~^https://.*\.vercel\.app$" $http_origin;
    "https://www.xiaodingyang.art" $http_origin;
    "https://xiaodingyang.art" $http_origin;
}

# 后端服务上游配置
upstream blog_backend_v1 {
    server 127.0.0.1:3000 max_fails=3 fail_timeout=30s;
    keepalive 32;
}

upstream blog_backend_v2 {
    server 127.0.0.1:8081 max_fails=3 fail_timeout=30s;
    keepalive 32;
}

server {
    server_name xiaodingyang.art www.xiaodingyang.art;

    root /var/www/myblog/frontend/dist;
    index index.html;

    # Gzip 压缩
    gzip on;
    gzip_vary on;
    gzip_comp_level 6;
    gzip_buffers 16 8k;
    gzip_http_version 1.1;
    gzip_min_length 1000;
    gzip_proxied any;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript image/svg+xml;

    # index.html 不缓存
    location = /index.html {
        add_header Cache-Control "no-cache, no-store, must-revalidate";
        add_header Pragma "no-cache";
        add_header Expires 0;
    }

    # 静态资源长期缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        try_files $uri =404;
    }

    # ============================================
    # 新版 API 路径（推荐使用）
    # ============================================

    # 博客后端 API v2
    location /api/v2/blog/ {
        rewrite ^/api/v2/blog/(.*)$ /api/$1 break;

        proxy_pass http://blog_backend_v2;
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

    # 博客后端 API v1
    location /api/v1/blog/ {
        rewrite ^/api/v1/blog/(.*)$ /api/$1 break;

        proxy_pass http://blog_backend_v1;
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

    # ============================================
    # 兼容旧路径（逐步废弃）
    # ============================================

    # 兼容旧的 /vercel-api/ 路径
    location /vercel-api/ {
        rewrite ^/vercel-api/(.*)$ /api/$1 break;

        proxy_pass http://blog_backend_v2;
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

    # 兼容旧的 /api/ 路径
    location /api/ {
        proxy_pass http://blog_backend_v1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        proxy_read_timeout 60s;
        proxy_connect_timeout 10s;
    }

    # 上传文件代理
    location ^~ /uploads/ {
        proxy_pass http://blog_backend_v1;
        proxy_set_header Host $host;
        client_max_body_size 50M;
    }

    # Sitemap
    location = /sitemap.xml {
        proxy_pass http://blog_backend_v1;
        proxy_set_header Host $host;
    }

    # robots.txt
    location = /robots.txt {
        try_files $uri =404;
    }

    # SPA fallback
    location / {
        add_header Cache-Control "no-cache, no-store, must-revalidate";
        add_header Pragma "no-cache";
        add_header Expires 0;
        try_files $uri $uri/ /index.html;
    }

    # 禁止访问隐藏文件
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }

    listen 443 ssl http2;
    ssl_certificate /etc/letsencrypt/live/xiaodingyang.art/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/xiaodingyang.art/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}

server {
    listen 80;
    server_name xiaodingyang.art www.xiaodingyang.art;
    return 301 https://$host$request_uri;
}
EOF

    # 替换时间戳
    sed -i "s/TIMESTAMP_PLACEHOLDER/$(date '+%Y-%m-%d %H:%M:%S')/g" "$NGINX_CONF_FILE.new"

    log_success "新配置文件已生成: $NGINX_CONF_FILE.new"
}

# 测试新配置
test_new_config() {
    log_info "测试新配置语法..."

    # 临时替换配置
    mv "$NGINX_CONF_FILE" "$NGINX_CONF_FILE.old"
    mv "$NGINX_CONF_FILE.new" "$NGINX_CONF_FILE"

    if nginx -t 2>&1 | grep -q "successful"; then
        log_success "配置语法测试通过"
        rm "$NGINX_CONF_FILE.old"
        return 0
    else
        log_error "配置语法测试失败"
        # 回滚
        mv "$NGINX_CONF_FILE" "$NGINX_CONF_FILE.failed"
        mv "$NGINX_CONF_FILE.old" "$NGINX_CONF_FILE"
        log_warning "已回滚到旧配置"
        return 1
    fi
}

# 重载 Nginx
reload_nginx() {
    log_info "重载 Nginx..."
    if systemctl reload nginx; then
        log_success "Nginx 重载成功"
    else
        log_error "Nginx 重载失败"
        exit 1
    fi
}

# 验证服务
verify_services() {
    log_info "验证服务..."

    # 测试旧路径
    if curl -s -o /dev/null -w "%{http_code}" "https://www.xiaodingyang.art/vercel-api/health" | grep -q "200"; then
        log_success "旧路径 /vercel-api/ 正常"
    else
        log_warning "旧路径 /vercel-api/ 异常"
    fi

    # 测试新路径
    if curl -s -o /dev/null -w "%{http_code}" "https://www.xiaodingyang.art/api/v2/blog/health" | grep -q "200"; then
        log_success "新路径 /api/v2/blog/ 正常"
    else
        log_warning "新路径 /api/v2/blog/ 异常（可能后端未更新路径）"
    fi
}

# 显示迁移总结
show_summary() {
    echo ""
    echo "============================================"
    echo -e "${GREEN}迁移完成！${NC}"
    echo "============================================"
    echo ""
    echo "📋 配置信息:"
    echo "  - 备份文件: $BACKUP_FILE"
    echo "  - 当前配置: $NGINX_CONF_FILE"
    echo ""
    echo "🎯 新增功能:"
    echo "  - ✅ 动态 CORS 配置（支持所有 Vercel 域名）"
    echo "  - ✅ upstream 服务抽象（支持健康检查）"
    echo "  - ✅ 规范化 API 路径（/api/v2/blog/）"
    echo "  - ✅ 向后兼容旧路径（/vercel-api/）"
    echo ""
    echo "📝 后续步骤:"
    echo "  1. 更新前端环境变量（可选）:"
    echo "     API_BASE_URL=https://www.xiaodingyang.art/api/v2/blog"
    echo ""
    echo "  2. 新增服务示例（复制以下模板）:"
    echo "     upstream new_service {"
    echo "         server 127.0.0.1:8082 max_fails=3 fail_timeout=30s;"
    echo "         keepalive 32;"
    echo "     }"
    echo ""
    echo "     location /api/v1/new-service/ {"
    echo "         rewrite ^/api/v1/new-service/(.*)$ /api/$1 break;"
    echo "         proxy_pass http://new_service;"
    echo "         # ... 其他配置同 blog_backend_v2"
    echo "     }"
    echo ""
    echo "  3. 查看详细文档:"
    echo "     - scalability-analysis.md"
    echo "     - nginx-scalable-config.conf"
    echo ""
    echo "🔧 管理命令:"
    echo "  - 查看日志: tail -f /var/log/nginx/error.log"
    echo "  - 测试配置: nginx -t"
    echo "  - 重载配置: systemctl reload nginx"
    echo "  - 回滚配置: cp $BACKUP_FILE $NGINX_CONF_FILE && systemctl reload nginx"
    echo ""
}

# 主函数
main() {
    echo "============================================"
    echo "Nginx 配置优化迁移脚本"
    echo "============================================"
    echo ""

    check_root
    check_nginx
    create_backup_dir
    backup_config
    generate_new_config

    if test_new_config; then
        reload_nginx
        sleep 2
        verify_services
        show_summary
    else
        log_error "迁移失败，请检查配置"
        exit 1
    fi
}

# 执行主函数
main
