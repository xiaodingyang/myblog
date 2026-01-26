import { defineConfig } from 'umi';

export default defineConfig({
  title: '个人博客',
  esbuildMinifyIIFE: true,
  
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
        { path: '/admin/settings', component: '@/pages/admin/settings/index' },
      ],
    },
    // 404
    { path: '/*', component: '@/pages/404' },
  ],
  
  // 代理配置 - 将 /api 请求转发到后端
  proxy: {
    '/api': {
      target: 'http://localhost:3000',
      changeOrigin: true,
    },
  },
  
  // Mock 配置 - 设置为 false 使用真实后端 API
  mock: false,
});
