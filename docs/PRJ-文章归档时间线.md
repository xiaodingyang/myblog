# PRD - 文章归档/时间线 🗓️

## 1. 概述

按年份/月份展示博客所有文章的时间线视图，方便读者按时间线浏览全部内容。

## 2. 页面路径

- `/archives` 或 `/timeline`

## 3. 功能点

### 3.1 时间线展示
- 按年份分组，年份大字突出显示
- 每篇文章显示：日期 + 标题 + 分类标签
- 点击标题跳转到文章详情页

### 3.2 后端 API
- `GET /api/articles/archives`
- 返回结构：`[{ year: 2026, months: [{ month: 4, articles: [...] }] }]`
- 只返回已发布的文章（status=published）
- 5 分钟缓存

## 4. 技术方案

### API
```javascript
// Aggregation 按 createdAt 年/月分组
Article.aggregate([
  { $match: { status: 'published' } },
  { $group: { _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } }, articles: { $push: { title: '$title', slug: '$_id', createdAt: '$createdAt', category: '$category' } } } },
  { $sort: { '_id.year': -1, '_id.month': -1 } }
])
```

### 前端
- 使用 Ant Design Timeline 组件展示时间线
- 按年份折叠/展开
