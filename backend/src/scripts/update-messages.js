/**
 * 更新留言数据 - 替换为更真实的网名和内容
 * 运行方式: node src/scripts/update-messages.js
 */

try {
  require('dotenv').config();
} catch (e) {}

const mongoose = require('mongoose');
const { Message } = require('../models');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/blog';

const messages = [
  {
    nickname: '代码搬运工',
    email: 'coder2024@163.com',
    content: '偶然搜到的博客，文章质量很高，已收藏，持续关注！',
    status: 'approved',
    createdAt: new Date('2025-11-02T09:14:00'),
  },
  {
    nickname: '前端小白菜',
    email: 'xiaobai_fe@qq.com',
    content: '刚入行的前端新手，看了你的React文章感觉受益匪浅，能不能出一期hooks的最佳实践？',
    status: 'approved',
    createdAt: new Date('2025-11-08T14:23:00'),
  },
  {
    nickname: 'DevNeko',
    email: 'devneko@gmail.com',
    content: 'Nice blog! Clean UI and solid content. Keep it up 👍',
    status: 'approved',
    createdAt: new Date('2025-11-15T20:45:00'),
  },
  {
    nickname: '夜猫子coder',
    email: 'nightowl_dev@126.com',
    content: '凌晨三点还在看博客学习的就我一个吗😂 写得太好了根本停不下来',
    status: 'approved',
    createdAt: new Date('2025-11-22T03:12:00'),
  },
  {
    nickname: '咖啡不加糖',
    email: 'blackcoffee@outlook.com',
    content: '博主的技术栈和我很像，互相学习~ 有没有考虑开个技术交流群？',
    status: 'approved',
    createdAt: new Date('2025-12-01T10:33:00'),
  },
  {
    nickname: '匿名访客',
    email: 'anon_visitor@qq.com',
    content: '路过留个脚印，博客做得挺好看的，粒子特效很酷',
    status: 'approved',
    createdAt: new Date('2025-12-05T16:08:00'),
  },
  {
    nickname: '0x1024',
    email: 'hex1024@proton.me',
    content: 'TypeScript那篇条件类型讲得不错，建议补充一下infer关键字的用法',
    status: 'approved',
    createdAt: new Date('2025-12-12T11:42:00'),
  },
  {
    nickname: '在逃程序员',
    email: 'runaway_dev@foxmail.com',
    content: '从掘金过来的，果然独立博客的体验就是不一样，清爽！加油更新💪',
    status: 'approved',
    createdAt: new Date('2025-12-20T08:55:00'),
  },
  {
    nickname: '菜鸡一只',
    email: 'newbie2025@sina.com',
    content: '大佬能不能出个项目从零搭建的教程啊，想学学整个博客是怎么做的',
    status: 'approved',
    createdAt: new Date('2026-01-03T15:27:00'),
  },
  {
    nickname: 'suki',
    email: 'sukidev@yahoo.com',
    content: '好久没看到这么用心的个人博客了，现在大家都在用第三方平台，你这个让我也想自己搭一个了',
    status: 'approved',
    createdAt: new Date('2026-01-10T19:04:00'),
  },
  {
    nickname: '摸鱼专家',
    email: 'moyu_master@gmail.com',
    content: '上班摸鱼看到的hh，CSS Grid那篇正好解决了我手上的布局问题，谢谢博主',
    status: 'approved',
    createdAt: new Date('2026-01-18T14:38:00'),
  },
  {
    nickname: '追风少年',
    email: 'windchaser@163.com',
    content: 'Node.js性能优化那篇写得很实在，不是那种纯理论的文章，点赞',
    status: 'approved',
    createdAt: new Date('2026-02-02T22:16:00'),
  },
  {
    nickname: '小橘子',
    email: 'little_orange@qq.com',
    content: '请问博主用的什么markdown编辑器呀？文章排版看着很舒服',
    status: 'approved',
    createdAt: new Date('2026-02-14T12:50:00'),
  },
  {
    nickname: 'Zzz_ing',
    email: 'zzzing@hotmail.com',
    content: '收藏了，以后慢慢看。博主更新频率怎么样？',
    status: 'approved',
    createdAt: new Date('2026-02-28T17:33:00'),
  },
  {
    nickname: '孤独的root',
    email: 'lonely_root@linux.do',
    content: '部署方案是用的Docker还是直接跑的？看着像是Nginx+PM2的经典组合',
    status: 'approved',
    createdAt: new Date('2026-03-05T21:09:00'),
  },
];

const run = async () => {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected');

    console.log('🗑️  Clearing old messages...');
    await Message.deleteMany({});

    console.log('💬 Creating new messages...');
    await Message.insertMany(messages);

    console.log(`✅ Done! Created ${messages.length} messages.`);
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
};

run();
