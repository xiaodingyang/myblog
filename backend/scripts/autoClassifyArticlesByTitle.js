/**
 * 按「标题 + 摘要」关键词规则，自动为文章设置 category（与当前五类栏目对齐）。
 *
 * 默认演练（只打印将发生的变更）；加 --apply 才写库。
 * 默认只处理已发布文章；加 --include-drafts 则包含草稿。
 *
 *   cd myblog/backend
 *   node scripts/autoClassifyArticlesByTitle.js
 *   node scripts/autoClassifyArticlesByTitle.js --apply
 *   node scripts/autoClassifyArticlesByTitle.js --apply --include-drafts
 *
 * 线上（SSH 到服务器后，在 backend 目录、配置好 MONGODB_URI）执行同上命令即可。
 */

try {
  require('dotenv').config();
} catch (_) {}

const mongoose = require('mongoose');
const { Article, Category } = require('../src/models');
const { classifyToCategoryName } = require('./lib/classifyToCategoryName');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/blog';
const APPLY = process.argv.includes('--apply');
const INCLUDE_DRAFTS = process.argv.includes('--include-drafts');

function buildClassifyText(article) {
  const sum = (article.summary || '').replace(/\s+/g, ' ').trim();
  const sumShort = sum.slice(0, 280);
  return `${article.title || ''} ${sumShort}`.trim();
}

async function main() {
  console.log(APPLY ? '⚠️  --apply：将更新 articles.category' : '🔍 演练模式（不加 --apply 不写库）');
  console.log(INCLUDE_DRAFTS ? '📄 含草稿' : '📄 仅 status=published');
  console.log('连接:', MONGODB_URI.replace(/:[^:@/]+@/, ':****@'));

  await mongoose.connect(MONGODB_URI);
  const categories = await Category.find().lean();
  const catIdByName = new Map(categories.map((c) => [c.name, c._id]));
  const required = [
    '前端开发',
    '后端开发',
    '运维与 DevOps',
    '技术综合',
    '技术随笔与成长',
  ];
  for (const n of required) {
    if (!catIdByName.has(n)) {
      console.error(`❌ 缺少分类「${n}」，请先保证 categories 集合为五类体系。`);
      process.exit(1);
    }
  }

  const query = INCLUDE_DRAFTS ? {} : { status: 'published' };
  const articles = await Article.find(query)
    .select('title summary status category')
    .populate('category', 'name')
    .lean();

  const defaultId = catIdByName.get('技术随笔与成长');
  let change = 0;
  let same = 0;
  const samples = [];

  const bulk = [];

  for (const art of articles) {
    const text = buildClassifyText(art);
    const bucket = classifyToCategoryName(text);
    const newCatId = catIdByName.get(bucket) || defaultId;
    const curName = art.category?.name || '';
    const curId = art.category?._id || art.category;

    if (String(newCatId) === String(curId)) {
      same += 1;
      continue;
    }
    change += 1;
    if (samples.length < 25) {
      samples.push({
        title: (art.title || '').slice(0, 56),
        status: art.status,
        from: curName || String(curId),
        to: bucket,
      });
    }
    bulk.push({
      updateOne: {
        filter: { _id: art._id },
        update: { $set: { category: newCatId } },
      },
    });
  }

  console.log(`\n📊 共 ${articles.length} 篇，将调整分类 ${change} 篇，已匹配不变 ${same} 篇\n`);
  if (samples.length) {
    console.log('示例（最多 25 条）：');
    for (const s of samples) {
      console.log(`  - [${s.status}] ${s.title}`);
      console.log(`    ${s.from} → ${s.to}`);
    }
  }

  if (APPLY && bulk.length) {
    await Article.bulkWrite(bulk, { ordered: false });
    console.log(`\n✅ 已写入 ${bulk.length} 条更新`);
  } else if (APPLY) {
    console.log('\n✅ 无需写入');
  } else {
    console.log('\n（演练结束）若要执行，请加 --apply');
  }

  await mongoose.disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
