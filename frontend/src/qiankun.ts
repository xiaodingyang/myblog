import { registerMicroApps, start } from 'qiankun';

// 注册微应用
registerMicroApps([
  {
    name: 'commentApp',
    entry: '//localhost:8002/myblog-comment-mf',
    container: '#comment-container',
    activeRule: '/article',
  },
]);

// 启动 qiankun
start({
  prefetch: false, // 关闭预加载
  sandbox: { strictStyleIsolation: true }, // 样式隔离
});

export default {};
