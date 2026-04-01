# PRD - 读者互动排行 🏆

## 1. 功能概述

评论区活跃用户排行榜，按评论数排序，轻微游戏化，激励用户参与评论。

## 2. 功能点

### 2.1 排行榜页面
- 路径：`/rankings` 或 `/rankings/comments`
- 展示：Top 20 活跃评论用户
- 每条展示：排名、头像、用户名、评论数
- 前三名特殊样式（金银铜皇冠/徽章）

### 2.2 后端 API
- `GET /api/rankings/comments`
  - 返回：rank, userId, username, avatar, commentCount, latestCommentTime
  - 默认 Top 20，可传 limit 参数
  - 缓存：5 分钟（减少 DB 压力）

### 2.3 数据库
- 利用现有 Comment 模型，无需新增集合
- 通过 Aggregation 聚合查询

## 3. 游戏化设计

| 排名 | 样式 |
|------|------|
| 🥇 第1名 | 金色皇冠 + 发光效果 |
| 🥈 第2名 | 银色皇冠 |
| 🥉 第3名 | 铜色皇冠 |
| 4-20名 | 数字排名 |

## 4. 技术方案

### API 设计
```
GET /api/rankings/comments?limit=20

Response:
{
  "success": true,
  "data": [
    { "rank": 1, "userId": "...", "username": "xxx", "avatar": "url", "commentCount": 42, "latestCommentTime": "2026-04-01" },
    ...
  ]
}
```

### Aggregation 策略
```javascript
Comment.aggregate([
  { $match: { status: 'approved' } },
  { $group: { _id: '$user', commentCount: { $sum: 1 }, latestCommentTime: { $max: '$createdAt' } } },
  { $sort: { commentCount: -1 } },
  { $limit: 20 },
  { $lookup: { from: 'githubusers', localField: '_id', foreignField: '_id', as: 'user' } },
  { $unwind: '$user' },
  { $project: { rank: 0, 'user._id': 0, 'user.githubId': 0 } }
])
```

## 5. 页面原型要点

- 顶部标题："🏆 评论活跃榜"
- 列表样式：卡片式，每个用户一行
- 头像 + 用户名 + 评论数
- 前三名大图标突出
- 响应式：移动端紧凑排列

## 6. Milestone

- [ ] 后端 API 开发
- [ ] 前端排行榜页面
- [ ] 集成测试
- [ ] 部署上线
