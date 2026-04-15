import { defineConfig } from 'umi';

export default defineConfig({
  title: '若风的博客 - 前端技术分享',
  /** browser history：线上需 Nginx `try_files $uri $uri/ /index.html;`（见仓库 nginx.conf） */
  history: { type: 'browser' },
  esbuildMinifyIIFE: true,
  links: [
    { rel: 'icon', href: '/favicon.png', type: 'image/png' },
    { rel: 'preconnect', href: 'https://www.xiaodingyang.art' },
    { rel: 'dns-prefetch', href: 'https://www.xiaodingyang.art' },
    { rel: 'preload', href: '/umi.css', as: 'style' },
  ],
  metas: [
    { name: 'baidu-site-verification', content: 'codeva-T2MxTzyMwa' },
    { name: 'description', content: '若风的个人技术博客，专注前端开发，分享 React、TypeScript、Node.js 等技术文章与实践经验。' },
    { name: 'keywords', content: '若风,前端开发,React,TypeScript,Node.js,技术博客,JavaScript,Vue' },
    { name: 'author', content: '若风' },
    { property: 'og:site_name', content: '若风的博客' },
    { property: 'og:locale', content: 'zh_CN' },
    { name: 'renderer', content: 'webkit' },
    { name: 'applicable-device', content: 'pc,mobile' },
  ],
  headScripts: [
    // 内联关键 CSS
    `(function(){
      function inject(){
        try {
          var style = document.createElement('style');
          style.textContent = '.gradient-text-white{background:linear-gradient(135deg,#fff 0%,rgba(255,255,255,0.8) 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}.gradient-text-dynamic{background:linear-gradient(135deg,var(--gradient-color) 0%,var(--gradient-color-end) 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}h1.ant-typography{font-display:swap}.ant-layout-header.front-header-dark{background:linear-gradient(90deg,rgba(15,23,42,.78) 0%,rgba(59,130,246,.22) 50%,rgba(15,23,42,.78) 100%)!important;backdrop-filter:blur(20px) saturate(180%)!important;border-bottom:1px solid rgba(255,255,255,.12)!important;position:fixed!important;width:100%!important;z-index:50!important;height:64px!important}.reading-progress-bar{position:fixed;top:0;left:0;height:3px;z-index:9999;transition:width .1s linear}.home-fullscreen-section{height:100dvh;width:100%}';
          var head = document.head || document.getElementsByTagName('head')[0] || document.documentElement;
          head.appendChild(style);
        } catch (e) {}
      }
      if (document.head) inject();
      else document.addEventListener('DOMContentLoaded', inject, { once: true });
    })();`,
    // 注销旧 Service Worker（仅生产环境）
    `(function(){
      if ('serviceWorker' in navigator && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
        navigator.serviceWorker.getRegistrations().then(function(registrations) {
          registrations.forEach(function(reg) { reg.unregister(); });
        });
      }
    })();`,
    // 版本检测 - 自动更新到最新版本（无感知刷新）
    `(function(){
      if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') return;
      var BUILD_VERSION = '${Date.now()}';
      var STORAGE_KEY = 'app_build_version';
      var stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        localStorage.setItem(STORAGE_KEY, BUILD_VERSION);
      } else if (stored !== BUILD_VERSION) {
        // 检测到新版本，清除缓存并刷新
        localStorage.setItem(STORAGE_KEY, BUILD_VERSION);
        if ('caches' in window) {
          caches.keys().then(function(names) {
            names.forEach(function(name) { caches.delete(name); });
          });
        }
        window.location.reload();
      }
    })();`,
    // 异步 chunk 加载失败时自动刷新页面（仅重试一次，防止死循环）
    `(function(){
      window.addEventListener('error', function(e) {
        var target = e.target || e.srcElement;
        if (target && target.tagName === 'SCRIPT' && /\\.async\\.js/.test(target.src || '')) {
          var key = 'chunk_retry_' + target.src;
          if (!sessionStorage.getItem(key)) {
            sessionStorage.setItem(key, '1');
            window.location.reload();
          }
        }
      }, true);
    })();`,
    // 百度自动推送 - 使用 requestIdleCallback 延迟到浏览器空闲时执行，不阻塞首屏
    `(function(){
      function inject(){
        try {
          var bp = document.createElement('script');
          bp.async = true;
          var curProtocol = window.location.protocol.split(':')[0];
          bp.src = curProtocol === 'https'
            ? 'https://zz.bdstatic.com/linksubmit/push.js'
            : 'http://push.zhanzhang.baidu.com/push.js';
          (document.head || document.documentElement).appendChild(bp);
        } catch (e) {}
      }
      if ('requestIdleCallback' in window) requestIdleCallback(inject, { timeout: 3000 });
      else setTimeout(inject, 1000);
    })();`,
  ],
  
  // 启用内置插件
  plugins: [
    '@umijs/plugins/dist/antd',
    '@umijs/plugins/dist/initial-state',
    '@umijs/plugins/dist/model',
    '@umijs/plugins/dist/request',
  ],
  
  // 插件配置
  antd: {},
  initialState: {},
  model: {},
  request: {},

  // 环境变量定义
  define: {
    'process.env.API_BASE_URL': process.env.NODE_ENV === 'production'
      ? 'http://162.14.83.58:8081'  // 生产环境后端地址
      : 'http://localhost:8081',     // 开发环境后端地址
  },
  
  // 路由配置
  routes: [
    // 前台路由
    {
      path: '/',
      component: '@/layouts/FrontLayout',
      routes: [
        { path: '/', component: '@/pages/home/index' },
        { path: '/articles', component: '@/pages/articles/index' },
        { path: '/tools', component: '@/pages/tools' },
        { path: '/article/:id', component: '@/pages/articles/detail' },
        { path: '/archives', component: '@/pages/archives/index' },
        { path: '/categories', component: '@/pages/categories/index' },
        { path: '/category/:id', component: '@/pages/categories/detail' },
        { path: '/tags', component: '@/pages/tags/index' },
        { path: '/tag/:id', component: '@/pages/tags/detail' },
        { path: '/about', component: '@/pages/about/index' },
        { path: '/rankings', component: '@/pages/rankings/index' },
        { path: '/favorites', component: '@/pages/favorites/index' },
        { path: '/message', component: '@/pages/message/index' },
      ],
    },
    // 后台登录
    { path: '/admin/login', component: '@/pages/admin/login' },
    // 后台路由
    {
      path: '/admin',
      component: '@/layouts/AdminLayout',
      routes: [
        { path: '/admin', redirect: '/admin/dashboard' },
        { path: '/admin/dashboard', component: '@/pages/admin/dashboard/index' },
        { path: '/admin/articles', component: '@/pages/admin/articles/index' },
        { path: '/admin/articles/create', component: '@/pages/admin/articles/create' },
        { path: '/admin/articles/edit/:id', component: '@/pages/admin/articles/edit' },
        { path: '/admin/categories', component: '@/pages/admin/categories/index' },
        { path: '/admin/tags', component: '@/pages/admin/tags/index' },
        { path: '/admin/messages', component: '@/pages/admin/messages/index' },
        { path: '/admin/comments', component: '@/pages/admin/comments/index' },
        { path: '/admin/users', component: '@/pages/admin/users/index' },
        { path: '/admin/settings', component: '@/pages/admin/settings/index' },
        { path: '/admin/stats', component: '@/pages/admin/stats/index' },
        { path: '/admin/series', component: '@/pages/admin/series/index' },
      ],
    },
    // 404
    { path: '/*', component: '@/pages/404' },
  ],
  
  // 代理配置 - 仅开发环境生效，生产环境不需要代理
  proxy: process.env.NODE_ENV === 'development' ? {
    '/api': {
      target: 'http://localhost:8081',
      changeOrigin: true,
      secure: false,
    },
    '/uploads': {
      target: 'http://localhost:8081',
      changeOrigin: true,
      secure: false,
    },
  } : {},
  
  // Mock 配置 - 设置为 false 使用真实后端 API
  mock: false,

  // MFSU 配置 - 关闭 eager 策略，解决 HMR 热更新失效问题
  mfsu: {
    strategy: 'normal',
  },

  // ── SSG 静态站点生成 ──
  // 启用静态导出，为每个路由生成独立 HTML 文件
  // 动态路由页面（如 /article/:id）保持 CSR，不预渲染
  // exportStatic: {
  //   // 忽略预渲染错误，确保构建不中断
  //   ignorePreRenderError: true,
  // },

  // 代码分割优化（仅生产构建生效，开发模式 MFSU 自行管理）
  chainWebpack(config: any, { env }: any) {
    if (env === 'production') {
      // 压缩优化
      config.optimization.minimize(true);

      config.optimization.splitChunks({
        chunks: 'all',
        cacheGroups: {
          react: {
            name: 'react',
            test: /[\\/]node_modules[\\/](react|react-dom|react-router|react-router-dom|scheduler)[\\/]/,
            priority: 30,
            enforce: true,
          },
          antd: {
            name: 'antd',
            test: /[\\/]node_modules[\\/](antd|@ant-design)[\\/]/,
            priority: 20,
            enforce: true,
          },
          markdown: {
            name: 'markdown',
            test: /[\\/]node_modules[\\/](react-markdown|remark-gfm|rehype-raw|rehype-highlight|react-syntax-highlighter)[\\/]/,
            priority: 25,
            enforce: true,
          },
          particles: {
            name: 'particles',
            test: /[\\/]node_modules[\\/](@xdy-npm|@tsparticles|three|framer-motion)[\\/]/,
            priority: 25,
            enforce: true,
          },
          vendors: {
            name: 'vendors',
            test: /[\\/]node_modules[\\/]/,
            priority: 10,
            enforce: true,
          },
        },
      });
    }
  },
});
