import { defineConfig } from 'umi';

export default defineConfig({
  title: '评论系统 - React 19 微前端',
  npmClient: 'pnpm',

  // MFSU 多 chunk 开发态下 UMD 与 qiankun 解析 entry 导出易不一致，子应用建议关闭
  mfsu: false,

  // qiankun / import-html-entry 通过遍历全局属性推断 entry 导出；webpack 会先挂 webpackChunk*，
  // 易导致取错导出。关闭 asyncChunks 使入口更易被正确识别，且与 UMD 子应用更稳。
  chainWebpack(config) {
    config.output.globalObject('window');
    config.merge({ output: { asyncChunks: false } });
  },

  // 启用 qiankun 插件
  plugins: ['@umijs/plugins/dist/qiankun'],

  // qiankun 微应用配置
  qiankun: {
    slave: {
      // 与主应用 registerMicroApps / loadMicroApp 的 name 一致（默认取 package.json name）
      appName: 'myblog-comment-mf',
      shouldNotAddLibraryChunkName: true,
    },
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
