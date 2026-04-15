const fs = require('fs');
const { MongoClient } = require('mongodb');
const bson = require('bson');

async function importData() {
  const client = new MongoClient('mongodb://localhost:27017/');

  try {
    await client.connect();
    console.log('✅ 连接到本地 MongoDB');

    const db = client.db('blog');

    // 读取备份文件
    const archiveData = fs.readFileSync('C:\\Users\\34662\\AppData\\Local\\Temp\\blog_backup.archive');
    console.log(`📦 读取备份文件: ${(archiveData.length / 1024 / 1024).toFixed(2)} MB`);

    // 解析 BSON archive
    let offset = 0;
    let currentCollection = null;
    const docsByCollection = {};

    while (offset < archiveData.length) {
      try {
        // 读取文档大小（前4字节）
        if (offset + 4 > archiveData.length) break;

        const docSize = archiveData.readInt32LE(offset);

        // 验证文档大小
        if (docSize <= 0 || docSize > 16 * 1024 * 1024 || offset + docSize > archiveData.length) {
          offset++;
          continue;
        }

        // 提取并解析 BSON 文档
        const docBuffer = archiveData.slice(offset, offset + docSize);
        const doc = bson.deserialize(docBuffer);

        // 检查是否是元数据文档（包含 ns 字段）
        if (doc.ns) {
          currentCollection = doc.ns.includes('.') ? doc.ns.split('.')[1] : doc.ns;
          if (!docsByCollection[currentCollection]) {
            docsByCollection[currentCollection] = [];
          }
        } else if (currentCollection) {
          // 普通数据文档
          docsByCollection[currentCollection].push(doc);
        }

        offset += docSize;

      } catch (e) {
        offset++;
      }
    }

    // 导入数据到数据库
    console.log('\n📥 开始导入数据...');
    for (const [collName, docs] of Object.entries(docsByCollection)) {
      if (docs.length > 0) {
        try {
          await db.collection(collName).insertMany(docs, { ordered: false });
          console.log(`✅ ${collName}: ${docs.length} 条记录`);
        } catch (e) {
          // 可能有重复键，尝试逐个插入
          let successCount = 0;
          for (const doc of docs) {
            try {
              await db.collection(collName).insertOne(doc);
              successCount++;
            } catch (err) {
              // 忽略重复键错误
            }
          }
          console.log(`⚠️  ${collName}: ${successCount}/${docs.length} 条记录（部分重复）`);
        }
      }
    }

    // 验证结果
    console.log('\n📊 本地数据库统计:');
    const collections = await db.listCollections().toArray();
    for (const coll of collections.sort((a, b) => a.name.localeCompare(b.name))) {
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
