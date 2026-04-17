/**
 * 根据任意短文本（标题、摘要、旧分类名等）推断五类栏目名称之一。
 * 与线上 categories 集合中的 name 对齐；规则变更时请与 migrateCategoriesAndTags 场景一并考虑。
 */

const ESSAY_TOPIC_NAMES = new Set(
  [
    '效率提升',
    '职业规划',
    '开源贡献',
    '技术分享',
    '代码审查',
    '团队协作',
    '简历优化',
    '面试准备',
    '学习方法',
    '技术成长',
    '经验总结',
    '对比分析',
    '深入理解',
    '进阶技巧',
    '快速上手',
    '从零搭建',
    '重构优化',
    '性能分析',
    '问题排查',
    '技术选型',
    '实战案例',
    '原理剖析',
    '源码解析',
    '最佳实践',
    '踩坑记录',
  ].map((s) => s.trim()),
);

/**
 * @param {string} text 建议传入 `标题 + 空格 + 摘要`（摘要可截断，例如前 200 字）
 * @returns {'前端开发'|'后端开发'|'运维与 DevOps'|'技术综合'|'技术随笔与成长'}
 */
function classifyToCategoryName(text) {
  const raw = (text || '').trim();
  const n = raw.toLowerCase();

  if (ESSAY_TOPIC_NAMES.has(raw)) return '技术随笔与成长';

  const isOps =
    /docker|kubernetes|\bk8s\b|nginx|linux|ci\/?cd|github actions|jenkins|helm|prometheus|grafana|devops|运维|部署|容器|监控|日志|证书|https|负载均衡/.test(
      raw,
    ) || /devops|kubernetes|prometheus|grafana/.test(n);

  const isBackend =
    /\bnode\.js\b|\bnode\b|express|nestjs|\bnest\b|koa|mongo|redis|postgres|mysql|graphql|后端|数据库|\bapi\b|接口|server|\bjava\b|go\b|rust|python|django|fastapi|spring|微服务|消息队列|kafka|rabbitmq|elastic|prisma|\borm\b|路由设计|数据库设计|架构设计|restful/i.test(
      raw,
    ) || /\bapi\b/.test(n);

  const isFrontend =
    /react|vue|angular|svelte|nuxt|css|html|webpack|vite|javascript|typescript|前端|tailwind|antd|sass|less|wxml|小程序|界面|ui\b|ux\b|dom|浏览器|响应式|移动端适配|状态管理|组件设计|前端面试|uni-app|taro|react native|umi\b|next\.js|html5?/i.test(
      raw,
    ) ||
    /\breact\b|\bvue\b|\bcss\b|\bhtml\b|\bwebpack\b|\bvite\b|\bumi\b/.test(n);

  if (isOps && !isFrontend && !isBackend) return '运维与 DevOps';
  if (isOps && (isFrontend || isBackend)) return '技术综合';
  if (isBackend && !isFrontend) return '后端开发';
  if (isFrontend && !isBackend) return '前端开发';
  if (isBackend && isFrontend) return '技术综合';
  if (isBackend) return '后端开发';
  if (isFrontend) return '前端开发';
  return '技术随笔与成长';
}

module.exports = { classifyToCategoryName, ESSAY_TOPIC_NAMES };
