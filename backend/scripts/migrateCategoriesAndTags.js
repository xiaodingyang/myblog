/**
 * 一次性迁移：重建「分类」与「标签」集合，并修正文章的 category / tags 引用。
 *
 * 背景：线上 tags 曾被误写成与 categories 相同的数据；本脚本写入独立的分类体系与标签体系，
 * 并按旧名称规则映射到新的分类，按名称匹配挂上新的标签。
 *
 * 使用（务必先备份数据库）：
 *   cd myblog/backend
 *   set MONGODB_URI=你的生产连接串   （PowerShell: $env:MONGODB_URI="...")
 *   node scripts/migrateCategoriesAndTags.js
 *
 * 演练（不写库，只打印统计）：
 *   node scripts/migrateCategoriesAndTags.js --dry-run
 *   （PowerShell 勿用 set DRY_RUN=1，请用上述参数或 $env:DRY_RUN='1'）
 */

try {
  require('dotenv').config();
} catch (_) {}

const mongoose = require('mongoose');
const { Category, Tag, Article } = require('../src/models');
const { classifyToCategoryName } = require('./lib/classifyToCategoryName');

const argvDry = process.argv.includes('--dry-run');
const DRY_RUN =
  argvDry || process.env.DRY_RUN === '1' || process.env.DRY_RUN === 'true';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/blog';

/** 新分类：粗粒度栏目（含前端 / 后端 / 运维 / 综合 / 随笔） */
const CATEGORY_DEFS = [
  {
    name: '前端开发',
    description: 'Web 与客户端界面、交互、工程化（React/Vue/CSS/构建等）',
  },
  {
    name: '后端开发',
    description: '服务、接口、数据存储与业务逻辑（Node/Java/DB/API 等）',
  },
  {
    name: '运维与 DevOps',
    description: '部署、容器、CI/CD、监控、基础设施与稳定性',
  },
  {
    name: '技术综合',
    description: '架构、全栈、跨端方案、工程规范与难以单列方向的笔记',
  },
  {
    name: '技术随笔与成长',
    description: '学习方法、开源见闻、工具评测、职业与软技能等',
  },
];

/** 新标签：细粒度技术词（覆盖前端、后端、运维；名称须与模型 maxlength 20 一致） */
const TAG_NAMES = [
  // 前端
  'React',
  'Vue',
  'TypeScript',
  'JavaScript',
  'CSS',
  'HTML',
  'HTML5',
  'Webpack',
  'Vite',
  'Next.js',
  'Umi',
  'Ant Design',
  'Tailwind CSS',
  '小程序',
  '微信小程序',
  'uni-app',
  'Taro',
  'React Native',
  '性能优化',
  '响应式设计',
  '移动端适配',
  '状态管理',
  '组件设计',
  '前端面试',
  '浏览器',
  // 后端
  'Node.js',
  'Express',
  'NestJS',
  'Koa',
  'MongoDB',
  'Redis',
  'MySQL',
  'PostgreSQL',
  'REST API',
  'RESTful API',
  'GraphQL',
  'API设计',
  '数据库设计',
  '路由设计',
  '微服务',
  '消息队列',
  '架构设计',
  '前后端分离',
  // 运维 / DevOps
  'Docker',
  'Kubernetes',
  'CI/CD',
  'Nginx',
  'Linux',
  'GitHub Actions',
  '监控与日志',
  '日志监控',
  '自动化部署',
  '部署运维',
  'HTTPS与证书',
  'SEO',
  'SEO优化',
  // 通用与工具
  'Git',
  '工程化',
  'WebSocket',
  '单元测试',
  '测试',
  '代码规范',
  '错误处理',
  '安全防护',
  '系统设计',
  '安全',
  '跨平台开发',
  'AI Agent',
  'ChatGPT',
  'Claude',
  'OpenClaw',
  'Prompt Engineering',
  'Chrome DevTools',
  'Postman',
  'Cursor',
  'VSCode',
  '开源',
];

function uniqueIds(ids) {
  const seen = new Set();
  const out = [];
  for (const id of ids) {
    const s = id?.toString?.();
    if (!s || seen.has(s)) continue;
    seen.add(s);
    out.push(id);
  }
  return out;
}

async function main() {
  console.log(DRY_RUN ? '🔍 DRY_RUN=1，不会写入数据库' : '⚠️  将修改 categories、tags、articles 集合');
  console.log('连接:', MONGODB_URI.replace(/:[^:@/]+@/, ':****@'));

  await mongoose.connect(MONGODB_URI);
  console.log('✅ 已连接 MongoDB');

  const oldCats = await Category.find().lean();
  const oldTags = await Tag.find().lean();
  const oldCatById = new Map(oldCats.map((c) => [String(c._id), c]));
  const oldTagById = new Map(oldTags.map((t) => [String(t._id), t]));

  const articles = await Article.find().select('_id category tags').lean();
  console.log(`📄 文章数: ${articles.length}，旧分类: ${oldCats.length}，旧标签: ${oldTags.length}`);

  if (DRY_RUN) {
    const names = new Set(oldCats.map((c) => c.name));
    const looksLikeNewSet =
      oldCats.length === CATEGORY_DEFS.length &&
      CATEGORY_DEFS.every((d) => names.has(d.name));
    if (looksLikeNewSet) {
      console.log('当前库里的分类已是本脚本定义的 5 类，无需再做「旧名→新类」分布演练。');
    } else {
      const counts = {
        前端开发: 0,
        后端开发: 0,
        '运维与 DevOps': 0,
        技术综合: 0,
        技术随笔与成长: 0,
      };
      for (const c of oldCats) {
        const bucket = classifyToCategoryName(c.name);
        counts[bucket] = (counts[bucket] || 0) + 1;
      }
      console.log('（演练）按当前「分类」名称映射到新五类后的条数分布:', counts);
    }
    await mongoose.disconnect();
    return;
  }

  await Category.deleteMany({});
  await Tag.deleteMany({});
  console.log('🗑️  已清空 categories、tags');

  await Category.insertMany(
    CATEGORY_DEFS.map((c) => ({ name: c.name, description: c.description })),
  );
  await Tag.insertMany(TAG_NAMES.map((name) => ({ name })));

  const newCats = await Category.find().lean();
  const newTags = await Tag.find().lean();
  const catIdByName = new Map(newCats.map((c) => [c.name, c._id]));
  const tagIdByName = new Map(newTags.map((t) => [t.name, t._id]));

  const defaultCatId = catIdByName.get('技术随笔与成长');

  let bulk = [];
  const flush = async () => {
    if (!bulk.length) return;
    await Article.bulkWrite(bulk, { ordered: false });
    bulk = [];
  };

  for (const art of articles) {
    const oldCat = oldCatById.get(String(art.category));
    const oldCatName = oldCat?.name || '';
    const bucketName = classifyToCategoryName(oldCatName);
    const newCategoryId = catIdByName.get(bucketName) || defaultCatId;

    const namesFromTags = (art.tags || [])
      .map((tid) => oldTagById.get(String(tid))?.name)
      .filter(Boolean);

    const tagNames = new Set(namesFromTags);
    if (oldCatName && tagIdByName.has(oldCatName)) tagNames.add(oldCatName);

    const newTagIds = uniqueIds(
      [...tagNames].map((nm) => tagIdByName.get(nm)).filter(Boolean),
    );

    bulk.push({
      updateOne: {
        filter: { _id: art._id },
        update: { $set: { category: newCategoryId, tags: newTagIds } },
      },
    });

    if (bulk.length >= 100) await flush();
  }
  await flush();

  console.log('✅ 已插入新分类', newCats.length, '条、新标签', newTags.length, '条，并已更新文章引用');
  await mongoose.disconnect();
  console.log('✅ 完成');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
