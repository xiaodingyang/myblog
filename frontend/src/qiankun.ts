import { registerMicroApps, start } from 'qiankun';

// 注册微应用
registerMicroApps([
  {
    name: 'myblog-comment-mf',
    entry: '//localhost:8002/myblog-comment-mf',
    container: '#comment-container',
    activeRule: '/article',
  },
]);

// 启动 qiankun
start({
  prefetch: false, // 关闭预加载
  // loose: import-html-entry 在严格沙箱下用 with(proxy) 执行 UMD，与 webpack 的 self/global 组合时
  // 偶发无法拿到正确 entry 导出；loose 下由 (window,self)→proxy 显式注入，生命周期更稳定。
  sandbox: { loose: true, strictStyleIsolation: true },
});

export default {};
