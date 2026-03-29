import { defineConfig } from 'umi';

export default defineConfig({
  title: '若风的博客 - 前端技术分享',
  hash: true,
  esbuildMinifyIIFE: true,
  links: [
    { rel: 'icon', href: '/favicon.png', type: 'image/png' },
    { rel: 'preconnect', href: 'https://www.xiaodingyang.art' },
    { rel: 'dns-prefetch', href: 'https://www.xiaodingyang.art' },
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
      var style = document.createElement('style');
      style.textContent = '.gradient-text-white{background:linear-gradient(135deg,#fff 0%,rgba(255,255,255,0.8) 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}.gradient-text-dynamic{background:linear-gradient(135deg,var(--gradient-color) 0%,var(--gradient-color-end) 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}h1.ant-typography{font-display:swap}';
      document.head.appendChild(style);
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
    // 百度自动推送 - 用户访问页面时自动通知百度收录
    `(function(){
      var bp = document.createElement('script');
      var curProtocol = window.location.protocol.split(':')[0];
      if (curProtocol === 'https') {
        bp.src = 'https://zz.bdstatic.com/linksubmit/push.js';
      } else {
        bp.src = 'http://push.zhanzhang.baidu.com/push.js';
      }
      var s = document.getElementsByTagName("script")[0];
      s.parentNode.insertBefore(bp, s);
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
  
  // 路由配置
  routes: [
    // 前台路由
    {
      path: '/',
      component: '@/layouts/FrontLayout',
      routes: [
        { path: '/', component: '@/pages/home/index' },
        { path: '/articles', component: '@/pages/articles/index' },
        { path: '/article/:id', component: '@/pages/articles/detail' },
        { path: '/categories', component: '@/pages/categories/index' },
        { path: '/category/:id', component: '@/pages/categories/detail' },
        { path: '/tags', component: '@/pages/tags/index' },
        { path: '/tag/:id', component: '@/pages/tags/detail' },
        { path: '/about', component: '@/pages/about/index' },
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
      ],
    },
    // 404
    { path: '/*', component: '@/pages/404' },
  ],
  
  // 代理配置 - 开发环境将请求转发到本地后端
  proxy: {
    '/api': {
      target: 'https://www.xiaodingyang.art',
      changeOrigin: true,
      secure: false,
    },
    '/uploads': {
      target: 'https://www.xiaodingyang.art',
      changeOrigin: true,
      secure: false,
    },
  },
  
  // Mock 配置 - 设置为 false 使用真实后端 API
  mock: false,

  // 代码分割优化（仅生产构建生效，开发模式 MFSU 自行管理）
  chainWebpack(config: any, { env }: any) {
    if (env === 'production') {
      // 压缩优化
      config.optimization.minimize(true);

      config.optimization.splitChunks({
        chunks: 'all',
        maxInitialRequests: 25,
        minSize: 20000,
        cacheGroups: {
          antd: {
            name: 'antd',
            test: /[\\/]node_modules[\\/](antd|@ant-design)[\\/]/,
            priority: 20,
          },
          react: {
            name: 'react',
            test: /[\\/]node_modules[\\/](react|react-dom|react-router|react-router-dom)[\\/]/,
            priority: 30,
          },
          markdown: {
            name: 'markdown',
            test: /[\\/]node_modules[\\/](react-markdown|remark-gfm|rehype-raw|rehype-highlight)[\\/]/,
            priority: 25,
          },
          syntax: {
            name: 'syntax',
            test: /[\\/]node_modules[\\/]react-syntax-highlighter[\\/]/,
            priority: 25,
          },
          particles: {
            name: 'particles',
            test: /[\\/]node_modules[\\/](@xdy-npm|@tsparticles|three)[\\/]/,
            priority: 25,
          },
          vendors: {
            name: 'vendors',
            test: /[\\/]node_modules[\\/]/,
            priority: 10,
          },
        },
      });
    }
  },
});
