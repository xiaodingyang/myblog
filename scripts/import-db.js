const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

const MONGODB_URI = 'mongodb://localhost:27017';
const DB_NAME = 'blog';
const BACKUP_DIR = path.join(__dirname, '../backup/blog-backup-20260412/blog');

async function importCollection(db, collectionName) {
  const bsonFile = path.join(BACKUP_DIR, `${collectionName}.bson`);

  if (!fs.existsSync(bsonFile)) {
    console.log(`⚠️  ${collectionName}: 文件不存在，跳过`);
    return;
  }

  const collection = db.collection(collectionName);

  // 读取 BSON 文件
  const bsonData = fs.readFileSync(bsonFile);
  const documents = [];

  // 简单的 BSON 解析（每个文档以 4 字节长度开头）
  let offset = 0;
  while (offset < bsonData.length) {
    const docLength = bsonData.readInt32LE(offset);
    if (docLength <= 0 || offset + docLength > bsonData.length) break;

    const docBuffer = bsonData.slice(offset, offset + docLength);
    try {
      // 使用 MongoDB 的 BSON 库解析
      const BSON = require('bson');
      const doc = BSON.deserialize(docBuffer);
      documents.push(doc);
    } catch (err) {
      console.error(`解析文档失败: ${err.message}`);
    }

    offset += docLength;
  }

  if (documents.length > 0) {
    await collection.deleteMany({});
    await collection.insertMany(documents);
    console.log(`✅ ${collectionName}: 导入 ${documents.length} 条记录`);
  } else {
    console.log(`⚠️  ${collectionName}: 没有数据`);
  }
}

async function main() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('✅ 连接到 MongoDB');

    const db = client.db(DB_NAME);

    // 获取所有 .bson 文件
    const files = fs.readdirSync(BACKUP_DIR);
    const collections = files
      .filter(f => f.endsWith('.bson'))
      .map(f => f.replace('.bson', ''));

    console.log(`\n📦 开始导入 ${collections.length} 个集合...\n`);

    for (const collectionName of collections) {
      await importCollection(db, collectionName);
    }

    console.log('\n✅ 数据导入完成！');

  } catch (error) {
    console.error('❌ 导入失败:', error);
  } finally {
    await client.close();
  }
}

main();
