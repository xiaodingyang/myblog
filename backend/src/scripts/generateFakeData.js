/**
 * 生成假数据脚本
 * 让博客看起来像从2020年开始维护的
 * 
 * 运行方式: node src/scripts/generateFakeData.js
 */

const mongoose = require('mongoose');
const { Article, Message, User } = require('../models');

// MongoDB 连接地址
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/blog';

// 真实的中文名字库
const surnames = ['李', '王', '张', '刘', '陈', '杨', '赵', '黄', '周', '吴', '徐', '孙', '马', '朱', '胡', '郭', '林', '何', '高', '罗', '郑', '梁', '谢', '韩', '唐', '冯', '董', '萧', '曹', '袁', '邓', '许', '傅', '沈', '曾', '彭', '吕', '苏', '卢', '蒋', '蔡', '贾', '丁', '魏', '薛', '叶', '阎', '余', '潘', '杜', '戴', '夏', '钟', '汪', '田', '任', '姜', '范', '方', '石', '姚', '谭', '廖', '邹', '熊', '金', '陆', '郝', '孔', '白', '崔', '康', '毛', '邱', '秦', '江', '史', '顾', '侯', '邵', '孟', '龙', '万', '段', '雷', '钱', '汤', '尹', '黎', '易', '常', '武', '乔', '贺', '赖', '龚', '文'];
const maleNames = ['伟', '强', '磊', '军', '勇', '杰', '涛', '明', '超', '华', '刚', '辉', '斌', '鹏', '峰', '宇', '浩', '凯', '亮', '建', '飞', '龙', '波', '健', '兵', '俊', '彬', '博', '昊', '晨', '阳', '洋', '帆', '航', '宁', '鑫', '威', '毅', '成', '东'];
const femaleNames = ['芳', '娟', '敏', '静', '丽', '艳', '娜', '秀', '英', '华', '慧', '巧', '美', '婷', '雪', '飞', '萍', '霞', '玲', '桂', '凤', '洁', '梅', '琳', '素', '云', '莲', '真', '环', '雯', '倩', '琪', '璐', '欣', '蕾', '薇', '怡', '佳', '妍', '晴'];

// 生成随机中文名
const generateChineseName = () => {
  const surname = surnames[Math.floor(Math.random() * surnames.length)];
  const isMale = Math.random() > 0.5;
  const namePool = isMale ? maleNames : femaleNames;
  const nameLength = Math.random() > 0.3 ? 2 : 1; // 70%概率双字名
  let name = '';
  for (let i = 0; i < nameLength; i++) {
    name += namePool[Math.floor(Math.random() * namePool.length)];
  }
  return surname + name;
};

// 生成随机日期（2020年到现在）
const generateRandomDate = (startYear = 2020) => {
  const start = new Date(startYear, 0, 1);
  const end = new Date();
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

// 生成随机阅读量（100-10000）
const generateRandomViews = () => {
  return Math.floor(Math.random() * 9900) + 100;
};

// 留言模板（根据技术关键词生成）
const commentTemplates = {
  vue: [
    '这篇Vue的文章写得太好了，终于搞懂了响应式原理！',
    'Vue的这个知识点困扰我很久了，看完豁然开朗',
    '博主对Vue的理解很深入，收藏了',
    '正在学Vue，这篇文章帮了大忙，感谢分享',
    'Vue3的新特性讲得很清楚，点赞',
    '看了这篇Vue教程，感觉自己又行了',
    '请问Vue和React选哪个好？看完更倾向Vue了',
  ],
  react: [
    'React Hooks讲得很透彻，终于理解了',
    '这篇React文章质量很高，已分享给同事',
    'React的这个坑我也踩过，博主总结得很到位',
    '正在做React项目，这篇文章解决了我的问题',
    'React源码分析得很深入，佩服',
    '函数组件和类组件的区别终于搞清楚了',
    'Redux的部分讲得特别好，收藏学习',
  ],
  javascript: [
    'JavaScript基础很重要，这篇文章总结得很全面',
    'JS的这个知识点之前一直模糊，现在清楚了',
    '原型链终于搞懂了，感谢博主',
    '闭包的讲解很通俗易懂，赞',
    'ES6的新特性用起来真的很方便',
    '异步编程这块讲得很清晰',
    'this指向问题困扰我很久，看完明白了',
  ],
  typescript: [
    'TypeScript真的能提高代码质量，这篇文章讲得很好',
    'TS的类型体操有点难，但博主讲得很清楚',
    '正在把项目迁移到TS，这篇文章很有帮助',
    '泛型终于搞懂了，感谢分享',
  ],
  css: [
    'CSS布局一直是我的弱项，这篇文章帮了大忙',
    'Flex和Grid的区别终于搞清楚了',
    '响应式布局讲得很实用',
    'CSS动画效果真不错，学习了',
  ],
  interview: [
    '面试前看了这篇文章，很有帮助',
    '这些面试题整理得很全面，收藏了',
    '刚面完，确实问到了这里的内容',
    '准备跳槽，这篇文章来得正是时候',
    '大厂面试题总结得很到位',
  ],
  general: [
    '博主的文章质量一如既往的高，持续关注',
    '写得很详细，对新手很友好',
    '干货满满，已收藏',
    '终于找到讲得这么清楚的文章了',
    '博主有公众号吗？想第一时间看到更新',
    '这个系列文章都很棒，期待更多内容',
    '感谢分享，学到了很多',
    '文章排版很舒服，阅读体验很好',
    '作为一个前端新手，这篇文章帮了大忙',
    '写得真好，分享给我的小伙伴们了',
    '博主加油，期待更多优质内容',
    '每次看博主的文章都有新收获',
    '这个知识点之前一直没搞懂，现在明白了',
    '实战经验分享得很到位，很有参考价值',
    '代码示例很清晰，一看就懂',
  ],
};

// 根据文章标题获取相关评论
const getRelatedComment = (title) => {
  const titleLower = title.toLowerCase();
  let pool = [...commentTemplates.general];
  
  if (titleLower.includes('vue') || titleLower.includes('vuex')) {
    pool = [...pool, ...commentTemplates.vue];
  }
  if (titleLower.includes('react') || titleLower.includes('redux') || titleLower.includes('hooks')) {
    pool = [...pool, ...commentTemplates.react];
  }
  if (titleLower.includes('javascript') || titleLower.includes('js') || titleLower.includes('promise') || titleLower.includes('this') || titleLower.includes('闭包') || titleLower.includes('原型')) {
    pool = [...pool, ...commentTemplates.javascript];
  }
  if (titleLower.includes('typescript') || titleLower.includes('ts')) {
    pool = [...pool, ...commentTemplates.typescript];
  }
  if (titleLower.includes('css') || titleLower.includes('布局') || titleLower.includes('样式')) {
    pool = [...pool, ...commentTemplates.css];
  }
  if (titleLower.includes('面试') || titleLower.includes('interview')) {
    pool = [...pool, ...commentTemplates.interview];
  }
  
  return pool[Math.floor(Math.random() * pool.length)];
};

// 生成邮箱
const generateEmail = (name) => {
  const pinyinMap = {
    '李': 'li', '王': 'wang', '张': 'zhang', '刘': 'liu', '陈': 'chen',
    '杨': 'yang', '赵': 'zhao', '黄': 'huang', '周': 'zhou', '吴': 'wu',
  };
  const domains = ['qq.com', '163.com', 'gmail.com', 'outlook.com', 'foxmail.com', '126.com'];
  const prefix = pinyinMap[name[0]] || 'user';
  const domain = domains[Math.floor(Math.random() * domains.length)];
  return `${prefix}${Math.floor(Math.random() * 10000)}@${domain}`;
};

const generateFakeData = async () => {
  try {
    console.log('🔄 连接数据库...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ 数据库连接成功\n');

    // 1. 更新文章的创建时间和阅读量
    console.log('📝 更新文章数据...');
    const articles = await Article.find({});
    console.log(`   找到 ${articles.length} 篇文章`);

    for (const article of articles) {
      const randomDate = generateRandomDate(2020);
      const randomViews = generateRandomViews();
      
      await Article.findByIdAndUpdate(article._id, {
        createdAt: randomDate,
        updatedAt: randomDate,
        views: randomViews,
      });
      
      console.log(`   ✅ ${article.title.substring(0, 20)}... | 时间: ${randomDate.toLocaleDateString()} | 阅读: ${randomViews}`);
    }

    // 2. 清除旧留言，生成新的100条留言
    console.log('\n💬 生成留言数据...');
    await Message.deleteMany({});
    
    const messages = [];
    for (let i = 0; i < 100; i++) {
      const randomArticle = articles[Math.floor(Math.random() * articles.length)];
      const name = generateChineseName();
      const messageDate = generateRandomDate(2020);
      
      messages.push({
        nickname: name,
        email: generateEmail(name),
        content: getRelatedComment(randomArticle.title),
        status: Math.random() > 0.1 ? 'approved' : 'pending', // 90%已通过
        createdAt: messageDate,
        updatedAt: messageDate,
      });
    }
    
    // 按时间排序
    messages.sort((a, b) => a.createdAt - b.createdAt);
    
    await Message.insertMany(messages);
    console.log(`   ✅ 生成了 ${messages.length} 条留言`);

    // 3. 更新管理员用户的创建时间
    console.log('\n👤 更新用户数据...');
    const adminDate = new Date(2020, 0, 1); // 2020年1月1日
    await User.updateMany({}, {
      createdAt: adminDate,
      updatedAt: adminDate,
    });
    console.log('   ✅ 管理员账号创建时间已更新为2020年');

    console.log('\n' + '='.repeat(50));
    console.log('✅ 假数据生成完成！');
    console.log(`📊 统计：`);
    console.log(`   - 文章: ${articles.length} 篇（时间范围 2020-${new Date().getFullYear()}）`);
    console.log(`   - 留言: 100 条`);
    console.log(`   - 阅读量: 100-10000 随机`);

    await mongoose.disconnect();
    console.log('\n👋 数据库连接已关闭');
    process.exit(0);
  } catch (error) {
    console.error('❌ 错误:', error.message);
    process.exit(1);
  }
};

generateFakeData();
