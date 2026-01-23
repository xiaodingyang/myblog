import { defineMock } from 'umi';

// 模拟数据
const users = [
  {
    _id: 'user001',
    username: 'admin',
    email: 'admin@example.com',
    password: 'admin123',
    avatar: '',
    role: 'admin',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
];

const categories = [
  { _id: 'cat001', name: '前端开发', description: 'HTML、CSS、JavaScript、React、Vue等', articleCount: 5, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { _id: 'cat002', name: '后端开发', description: 'Node.js、Python、Java、数据库等', articleCount: 3, createdAt: '2024-01-02T00:00:00Z', updatedAt: '2024-01-02T00:00:00Z' },
  { _id: 'cat003', name: '技术随笔', description: '技术感悟、学习心得', articleCount: 2, createdAt: '2024-01-03T00:00:00Z', updatedAt: '2024-01-03T00:00:00Z' },
];

const tags = [
  { _id: 'tag001', name: 'React', articleCount: 4, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { _id: 'tag002', name: 'TypeScript', articleCount: 3, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { _id: 'tag003', name: 'Node.js', articleCount: 2, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { _id: 'tag004', name: 'Vue', articleCount: 2, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { _id: 'tag005', name: 'CSS', articleCount: 3, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { _id: 'tag006', name: 'JavaScript', articleCount: 5, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
];

const articles = [
  {
    _id: 'art001',
    title: 'React 18 新特性详解',
    content: '# React 18 新特性详解\n\nReact 18 带来了许多令人兴奋的新特性...\n\n## Concurrent Mode\n\n并发模式是 React 18 最重要的更新...\n\n## Automatic Batching\n\n自动批处理优化了状态更新...\n\n```jsx\nfunction App() {\n  const [count, setCount] = useState(0);\n  return <div>{count}</div>;\n}\n```\n\n## Suspense 改进\n\nSuspense 现在支持服务端渲染...',
    summary: 'React 18 带来了并发模式、自动批处理、Suspense 改进等新特性，本文详细介绍这些更新。',
    cover: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800',
    category: categories[0],
    tags: [tags[0], tags[1], tags[5]],
    views: 1280,
    status: 'published',
    author: users[0],
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
  },
  {
    _id: 'art002',
    title: 'TypeScript 高级类型技巧',
    content: '# TypeScript 高级类型技巧\n\n掌握 TypeScript 高级类型可以让你的代码更加健壮...\n\n## 条件类型\n\n```typescript\ntype IsString<T> = T extends string ? true : false;\n```\n\n## 映射类型\n\n```typescript\ntype Readonly<T> = {\n  readonly [K in keyof T]: T[K];\n};\n```',
    summary: '深入探讨 TypeScript 中的高级类型用法，包括条件类型、映射类型、工具类型等。',
    cover: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800',
    category: categories[0],
    tags: [tags[1], tags[5]],
    views: 856,
    status: 'published',
    author: users[0],
    createdAt: '2024-01-12T14:00:00Z',
    updatedAt: '2024-01-12T14:00:00Z',
  },
  {
    _id: 'art003',
    title: 'Node.js 性能优化实践',
    content: '# Node.js 性能优化实践\n\n本文总结了 Node.js 应用性能优化的关键技巧...\n\n## 使用集群\n\nNode.js 是单线程的，使用集群可以充分利用多核CPU...\n\n## 内存管理\n\n避免内存泄漏是提升性能的关键...',
    summary: '分享 Node.js 应用性能优化的实战经验，包括集群、内存管理、异步优化等。',
    cover: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800',
    category: categories[1],
    tags: [tags[2], tags[5]],
    views: 634,
    status: 'published',
    author: users[0],
    createdAt: '2024-01-10T09:00:00Z',
    updatedAt: '2024-01-10T09:00:00Z',
  },
  {
    _id: 'art004',
    title: 'CSS Grid 布局完全指南',
    content: '# CSS Grid 布局完全指南\n\nCSS Grid 是现代网页布局的利器...\n\n## 基础概念\n\n```css\n.container {\n  display: grid;\n  grid-template-columns: repeat(3, 1fr);\n  gap: 20px;\n}\n```',
    summary: '全面介绍 CSS Grid 布局系统，从基础概念到高级用法。',
    cover: 'https://images.unsplash.com/photo-1507721999472-8ed4421c4af2?w=800',
    category: categories[0],
    tags: [tags[4]],
    views: 445,
    status: 'published',
    author: users[0],
    createdAt: '2024-01-08T16:00:00Z',
    updatedAt: '2024-01-08T16:00:00Z',
  },
  {
    _id: 'art005',
    title: 'Vue 3 Composition API 最佳实践',
    content: '# Vue 3 Composition API 最佳实践\n\nComposition API 让 Vue 组件逻辑更加清晰...',
    summary: '探讨 Vue 3 Composition API 的使用技巧和最佳实践。',
    cover: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800',
    category: categories[0],
    tags: [tags[3], tags[5]],
    views: 378,
    status: 'published',
    author: users[0],
    createdAt: '2024-01-05T11:00:00Z',
    updatedAt: '2024-01-05T11:00:00Z',
  },
  {
    _id: 'art006',
    title: '我的技术成长之路',
    content: '# 我的技术成长之路\n\n回顾过去几年的学习经历...',
    summary: '分享我的技术成长经历和学习心得。',
    cover: '',
    category: categories[2],
    tags: [],
    views: 256,
    status: 'published',
    author: users[0],
    createdAt: '2024-01-03T08:00:00Z',
    updatedAt: '2024-01-03T08:00:00Z',
  },
];

const messages = [
  { _id: 'msg001', nickname: '张三', email: 'zhangsan@example.com', content: '博客写得很好，学到很多！', status: 'approved', createdAt: '2024-01-14T10:00:00Z', updatedAt: '2024-01-14T10:00:00Z' },
  { _id: 'msg002', nickname: '李四', email: 'lisi@example.com', content: '希望能多写一些 React 相关的文章', status: 'approved', createdAt: '2024-01-13T15:00:00Z', updatedAt: '2024-01-13T15:00:00Z' },
  { _id: 'msg003', nickname: '王五', email: 'wangwu@example.com', content: '文章内容深入浅出，非常棒！', status: 'pending', createdAt: '2024-01-15T09:00:00Z', updatedAt: '2024-01-15T09:00:00Z' },
  { _id: 'msg004', nickname: '赵六', email: 'zhaoliu@example.com', content: '请问能出一期 MongoDB 的教程吗？', status: 'pending', createdAt: '2024-01-15T14:00:00Z', updatedAt: '2024-01-15T14:00:00Z' },
];

// 响应封装
const success = (data: any) => ({ code: 0, message: 'success', data });
const error = (message: string, code = 1) => ({ code, message, data: null });

// 分页处理
const paginate = (list: any[], page: number, pageSize: number) => {
  const start = (page - 1) * pageSize;
  return {
    list: list.slice(start, start + pageSize),
    total: list.length,
    page,
    pageSize,
  };
};

export default defineMock({
  // 登录
  'POST /api/auth/login': (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
      const { password: _, ...userInfo } = user;
      res.json(success({ token: 'mock-token-' + Date.now(), user: userInfo }));
    } else {
      res.status(401).json(error('用户名或密码错误'));
    }
  },

  // 获取用户信息
  'GET /api/auth/profile': (req, res) => {
    const { password: _, ...userInfo } = users[0];
    res.json(success(userInfo));
  },

  // 更新用户信息
  'PUT /api/auth/profile': (req, res) => {
    const { password: _, ...userInfo } = users[0];
    res.json(success({ ...userInfo, ...req.body }));
  },

  // 修改密码
  'PUT /api/auth/password': (req, res) => {
    res.json(success(null));
  },

  // 获取文章列表（前台）
  'GET /api/articles': (req, res) => {
    const { page = 1, pageSize = 10, keyword, category, tag } = req.query;
    let list = articles.filter(a => a.status === 'published');
    
    if (keyword) {
      list = list.filter(a => a.title.includes(keyword as string));
    }
    if (category) {
      list = list.filter(a => a.category?._id === category);
    }
    if (tag) {
      list = list.filter(a => a.tags?.some(t => t._id === tag));
    }
    
    res.json(success(paginate(list, Number(page), Number(pageSize))));
  },

  // 获取文章详情
  'GET /api/articles/:id': (req, res) => {
    const article = articles.find(a => a._id === req.params.id);
    if (article) {
      res.json(success(article));
    } else {
      res.status(404).json(error('文章不存在'));
    }
  },

  // 获取分类列表
  'GET /api/categories': (req, res) => {
    res.json(success(categories));
  },

  // 获取分类详情
  'GET /api/categories/:id': (req, res) => {
    const category = categories.find(c => c._id === req.params.id);
    if (category) {
      res.json(success(category));
    } else {
      res.status(404).json(error('分类不存在'));
    }
  },

  // 获取标签列表
  'GET /api/tags': (req, res) => {
    res.json(success(tags));
  },

  // 获取标签详情
  'GET /api/tags/:id': (req, res) => {
    const tag = tags.find(t => t._id === req.params.id);
    if (tag) {
      res.json(success(tag));
    } else {
      res.status(404).json(error('标签不存在'));
    }
  },

  // 获取留言列表（前台）
  'GET /api/messages': (req, res) => {
    const { page = 1, pageSize = 20 } = req.query;
    const list = messages.filter(m => m.status === 'approved');
    res.json(success(paginate(list, Number(page), Number(pageSize))));
  },

  // 提交留言
  'POST /api/messages': (req, res) => {
    const newMessage = {
      _id: 'msg' + Date.now(),
      ...req.body,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    messages.unshift(newMessage);
    res.json(success(newMessage));
  },

  // =================== 后台接口 ===================

  // 获取统计数据
  'GET /api/admin/statistics': (req, res) => {
    res.json(success({
      articleCount: articles.length,
      categoryCount: categories.length,
      tagCount: tags.length,
      messageCount: messages.length,
      totalViews: articles.reduce((sum, a) => sum + a.views, 0),
    }));
  },

  // 获取文章列表（后台）
  'GET /api/admin/articles': (req, res) => {
    const { page = 1, pageSize = 10, keyword, status } = req.query;
    let list = [...articles];
    
    if (keyword) {
      list = list.filter(a => a.title.includes(keyword as string));
    }
    if (status) {
      list = list.filter(a => a.status === status);
    }
    
    res.json(success(paginate(list, Number(page), Number(pageSize))));
  },

  // 获取文章详情（后台）
  'GET /api/admin/articles/:id': (req, res) => {
    const article = articles.find(a => a._id === req.params.id);
    if (article) {
      res.json(success(article));
    } else {
      res.status(404).json(error('文章不存在'));
    }
  },

  // 创建文章
  'POST /api/admin/articles': (req, res) => {
    const newArticle = {
      _id: 'art' + Date.now(),
      ...req.body,
      views: 0,
      author: users[0],
      category: categories.find(c => c._id === req.body.category),
      tags: tags.filter(t => req.body.tags?.includes(t._id)),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    articles.unshift(newArticle);
    res.json(success(newArticle));
  },

  // 更新文章
  'PUT /api/admin/articles/:id': (req, res) => {
    const index = articles.findIndex(a => a._id === req.params.id);
    if (index > -1) {
      articles[index] = {
        ...articles[index],
        ...req.body,
        category: categories.find(c => c._id === req.body.category),
        tags: tags.filter(t => req.body.tags?.includes(t._id)),
        updatedAt: new Date().toISOString(),
      };
      res.json(success(articles[index]));
    } else {
      res.status(404).json(error('文章不存在'));
    }
  },

  // 删除文章
  'DELETE /api/admin/articles/:id': (req, res) => {
    const index = articles.findIndex(a => a._id === req.params.id);
    if (index > -1) {
      articles.splice(index, 1);
      res.json(success(null));
    } else {
      res.status(404).json(error('文章不存在'));
    }
  },

  // 创建分类
  'POST /api/admin/categories': (req, res) => {
    const newCategory = {
      _id: 'cat' + Date.now(),
      ...req.body,
      articleCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    categories.push(newCategory);
    res.json(success(newCategory));
  },

  // 更新分类
  'PUT /api/admin/categories/:id': (req, res) => {
    const index = categories.findIndex(c => c._id === req.params.id);
    if (index > -1) {
      categories[index] = { ...categories[index], ...req.body, updatedAt: new Date().toISOString() };
      res.json(success(categories[index]));
    } else {
      res.status(404).json(error('分类不存在'));
    }
  },

  // 删除分类
  'DELETE /api/admin/categories/:id': (req, res) => {
    const index = categories.findIndex(c => c._id === req.params.id);
    if (index > -1) {
      categories.splice(index, 1);
      res.json(success(null));
    } else {
      res.status(404).json(error('分类不存在'));
    }
  },

  // 创建标签
  'POST /api/admin/tags': (req, res) => {
    const newTag = {
      _id: 'tag' + Date.now(),
      ...req.body,
      articleCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    tags.push(newTag);
    res.json(success(newTag));
  },

  // 更新标签
  'PUT /api/admin/tags/:id': (req, res) => {
    const index = tags.findIndex(t => t._id === req.params.id);
    if (index > -1) {
      tags[index] = { ...tags[index], ...req.body, updatedAt: new Date().toISOString() };
      res.json(success(tags[index]));
    } else {
      res.status(404).json(error('标签不存在'));
    }
  },

  // 删除标签
  'DELETE /api/admin/tags/:id': (req, res) => {
    const index = tags.findIndex(t => t._id === req.params.id);
    if (index > -1) {
      tags.splice(index, 1);
      res.json(success(null));
    } else {
      res.status(404).json(error('标签不存在'));
    }
  },

  // 获取留言列表（后台）
  'GET /api/admin/messages': (req, res) => {
    const { page = 1, pageSize = 10, status } = req.query;
    let list = [...messages];
    
    if (status) {
      list = list.filter(m => m.status === status);
    }
    
    res.json(success(paginate(list, Number(page), Number(pageSize))));
  },

  // 审核留言
  'PUT /api/admin/messages/:id/review': (req, res) => {
    const index = messages.findIndex(m => m._id === req.params.id);
    if (index > -1) {
      messages[index] = { ...messages[index], status: req.body.status, updatedAt: new Date().toISOString() };
      res.json(success(messages[index]));
    } else {
      res.status(404).json(error('留言不存在'));
    }
  },

  // 删除留言
  'DELETE /api/admin/messages/:id': (req, res) => {
    const index = messages.findIndex(m => m._id === req.params.id);
    if (index > -1) {
      messages.splice(index, 1);
      res.json(success(null));
    } else {
      res.status(404).json(error('留言不存在'));
    }
  },

  // 文件上传
  'POST /api/upload': (req, res) => {
    res.json(success({
      url: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800',
      filename: 'mock-image.jpg',
    }));
  },
});
