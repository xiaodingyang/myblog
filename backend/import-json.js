const fs = require('fs');
const { MongoClient, ObjectId } = require('mongodb');
const path = require('path');

// 转换 MongoDB 扩展 JSON 格式
function convertExtendedJSON(obj) {
  if (obj === null || typeof obj !== 'object') return obj;

  if (Array.isArray(obj)) {
    return obj.map(convertExtendedJSON);
  }

  // 转换 ObjectId
  if (obj.$oid) {
    return new ObjectId(obj.$oid);
  }

  // 转换 Date
  if (obj.$date) {
    return new Date(obj.$date);
  }

  // 递归转换对象的所有属性
  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    result[key] = convertExtendedJSON(value);
  }
  return result;
}

const collections = [
  'users',
  'articles',
  'categories',
  'tags',
  'series',
  'comments',
  'favorites',
  'follows',
  'notifications',
  'messages',
  'visits',
  'githubusers'
];

async function importData() {
  const client = new MongoClient('mongodb://localhost:27017/');

  try {
    await client.connect();
    console.log('✅ 连接到本地 MongoDB');

    const db = client.db('blog');

    // 清空现有数据
    console.log('\n🗑️  清空现有数据...');
    for (const coll of collections) {
      await db.collection(coll).deleteMany({});
    }

    // 导入数据
    console.log('\n📥 开始导入数据...');
    const tmpDir = 'C:\\Users\\34662\\AppData\\Local\\Temp';

    for (const coll of collections) {
      const filePath = path.join(tmpDir, `${coll}.json`);

      if (!fs.existsSync(filePath)) {
        console.log(`⚠️  ${coll}: 文件不存在，跳过`);
        continue;
      }

      const fileContent = fs.readFileSync(filePath, 'utf8');
      if (!fileContent.trim()) {
        console.log(`⚠️  ${coll}: 空文件，跳过`);
        continue;
      }

      // 解析 JSON Lines 格式（每行一个 JSON 对象）
      const lines = fileContent.trim().split('\n');
      const docs = lines.map(line => convertExtendedJSON(JSON.parse(line)));

      if (docs.length > 0) {
        await db.collection(coll).insertMany(docs);
        console.log(`✅ ${coll}: ${docs.length} 条记录`);
      }
    }

    // 验证结果
    console.log('\n📊 本地数据库统计:');
    const allCollections = await db.listCollections().toArray();
    for (const coll of allCollections.sort((a, b) => a.name.localeCompare(b.name))) {
      const count = await db.collection(coll.name).countDocuments();
      console.log(`  ✅ ${coll.name}: ${count} 条记录`);
    }

    console.log('\n🎉 数据导入完成！');

  } catch (error) {
    console.error('❌ 错误:', error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

importData();
