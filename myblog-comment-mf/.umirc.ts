import { defineConfig } from 'umi';

export default defineConfig({
  title: '评论系统 - React 19 微前端',
  npmClient: 'pnpm',

  // 启用 qiankun 插件
  plugins: ['@umijs/plugins/dist/qiankun'],

  // qiankun 微应用配置
  qiankun: {
    slave: {},
  },

  // 微应用基础路径（与 nginx 转发路径一致）
  base: '/myblog-comment-mf',

  // 使用 browser history，指定 basename
  history: { type: 'browser', basename: '/myblog-comment-mf' },

  // 代理配置
  proxy: {
    '/api': {
      target: 'https://www.xiaodingyang.art',
      changeOrigin: true,
      secure: false,
    },
  },

  routes: [
    { path: '/', component: '@/pages/index' },
  ],
});
