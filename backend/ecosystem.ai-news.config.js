/**
 * PM2 配置文件示例
 * 用于生产环境管理 myblog 后端服务
 */

module.exports = {
  apps: [
    {
      name: 'blog-backend',
      script: 'src/index.js',
      instances: 2, // 生产环境建议 2+ 实例
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 8081,
      },
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
    },
    {
      name: 'ai-news-scheduler',
      script: 'scripts/scheduleAiNews.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
      },
      error_file: './logs/ai-news-error.log',
      out_file: './logs/ai-news-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
    },
  ],
};

/**
 * 使用方法：
 *
 * 1. 安装 PM2（如果未安装）
 *    npm install -g pm2
 *
 * 2. 启动所有服务
 *    pm2 start ecosystem.config.js
 *
 * 3. 查看状态
 *    pm2 status
 *    pm2 list
 *
 * 4. 查看日志
 *    pm2 logs
 *    pm2 logs blog-backend
 *    pm2 logs ai-news-scheduler
 *
 * 5. 重启服务
 *    pm2 restart all
 *    pm2 restart blog-backend
 *
 * 6. 停止服务
 *    pm2 stop all
 *    pm2 stop blog-backend
 *
 * 7. 删除服务
 *    pm2 delete all
 *    pm2 delete blog-backend
 *
 * 8. 监控
 *    pm2 monit
 *
 * 9. 保存配置（重启后自动启动）
 *    pm2 save
 *    pm2 startup
 *
 * 10. 查看详细信息
 *     pm2 show blog-backend
 *     pm2 describe ai-news-scheduler
 */
