# 若风博客 - 需求总览

> 整合自：PRJ-需求文档.md、PRJ-文章归档时间线.md、PRJ-读者互动排行.md
> 最后更新：2026-04-05

---

## 一、项目概述

若风的个人技术博客，专注前端开发，分享 React、TypeScript、Node.js 等技术文章与实践经验。

- **线上地址**：https://www.xiaodingyang.art
- **技术栈**：前端 Umi 4 + Ant Design 5 + Tailwind CSS，后端 Express + MongoDB
- **前后端分离**，Nginx 反向代理
- **CI/CD**：GitHub Actions + rsync + pm2 + Server酱微信通知

---

## 二、核心页面与功能

### 2.1 前台页面

| 页面 | 路由 | 说明 |
|------|------|------|
| 首页 | `/` | Hero 区域 + 精选文章 + 最新文章 + 分类/标签导航 |
| 文章列表 | `/articles` | 分页、搜索、分类/标签筛选、排序 |
| 文章详情 | `/article/:id` | Markdown 渲染、TOC 目录、评论、点赞、收藏、分享 |
| 文章归档 | `/archives` | 按年月分组的时间线视图 |
| 分类列表 | `/categories` | 所有分类 |
| 分类详情 | `/category/:id` | 分类下的文章 |
| 标签列表 | `/tags` | 所有标签 |
| 标签详情 | `/tag/:id` | 标签下的文章 |
| 排行榜 | `/rankings` | 热门文章排行 + 评论活跃榜 |
| 收藏夹 | `/favorites` | 登录用户的收藏列表 |
| 留言板 | `/message` | 留言互动（需 GitHub 登录） |
| 关于 | `/about` | 个人介绍 |
| 工具箱 | `/tools` | 开发者小工具集合 |
| 404 | `/*` | 404 页面 |

### 2.2 后台页面

| 页面 | 路由 | 说明 |
|------|------|------|
| 登录 | `/admin/login` | 管理员登录 |
| 仪表盘 | `/admin/dashboard` | 数据概览 |
| 文章管理 | `/admin/articles` | CRUD + 编辑器 |
| 分类管理 | `/admin/categories` | 分类 CRUD |
| 标签管理 | `/admin/tags` | 标签 CRUD |
| 留言管理 | `/admin/messages` | 留言审核 |
| 评论管理 | `/admin/comments` | 评论管理（审核/删除） |
| 用户管理 | `/admin/users` | GitHub 用户管理（封禁/解封/删除） |
| 设置 | `/admin/settings` | 站点设置 |

---

## 三、功能需求清单

### 3.1 用户系统
- [x] GitHub OAuth 登录（OAuth 2.0 授权码模式）
- [x] 游客登录浮层提示（首次访问 3 秒后弹出，sessionStorage 控制只弹一次）
- [x] 用户头像、昵称展示（导航栏下拉菜单）
- [x] 退出登录
- [x] JWT 双类型认证体系（admin / github），防止权限越权
- [x] 用户封禁机制（githubAuth 中间件校验 status）

### 3.2 文章系统
- [x] 文章列表（分页、搜索、筛选、排序）
- [x] 文章详情（Markdown 渲染 + 代码高亮）
- [x] 文章 TOC 目录导航
- [x] 文章封面图展示
- [x] 阅读量统计
- [x] 预估阅读时间
- [x] 文章点赞
- [x] 文章收藏
- [x] 文章分享（原生分享 API + QQ/微博等）
- [x] 复制页面链接
- [x] 相关文章推荐
- [x] "新"和"热门"标签
- [x] 阅读进度条

### 3.3 评论系统
- [x] 发表评论（需 GitHub 登录）
- [x] 回复评论
- [x] 评论点赞
- [x] 分页加载
- [x] "跳到评论区"浮动按钮

### 3.4 分类与标签
- [x] 分类列表 + 详情
- [x] 标签列表 + 详情
- [x] 文章列表按分类/标签筛选

### 3.5 排行榜
- [x] 热门文章排行
- [x] 评论活跃榜（Top 20，前三名金银铜样式）

### 3.6 文章归档/时间线
- [x] 按年月分组展示所有已发布文章
- [x] 路径：`/archives`
- [x] 后端 API：`GET /api/articles/archives`（Aggregation 按年月分组）
- [x] 5 分钟缓存

### 3.7 留言板
- [x] 留言发布（需 GitHub 登录）
- [x] 留言展示

### 3.8 界面美观
- [x] 粒子动态背景（Three.js）
- [x] 主题色切换（多套配色方案）
- [x] 毛玻璃背景效果
- [x] 渐变文字效果
- [x] 文章卡片玻璃拟态风格（毛玻璃 + 半透明边框 + 悬停上浮 + 发光边框）
- [x] 首页 Hero 动态渐变背景（6 色循环 8 秒周期）
- [x] 首页 Hero 打字机效果
- [x] 页面切换淡入 + 上移动画
- [x] 全局滚动条美化（细线风格）
- [x] 文字选中颜色跟随主题色
- [x] 统一圆角（卡片 12px / 按钮 8px）和阴影体系
- [x] 骨架屏加载（首页、文章列表、文章详情、留言）

### 3.9 用户体验与交互
- [x] 键盘快捷键（g→h 首页、j/k 上下篇、? 帮助）
- [x] 快捷键帮助弹窗
- [x] 回到顶部按钮
- [x] 滚动提示箭头（现代弹跳动画）
- [x] ErrorBoundary 错误边界
- [x] Empty 空状态增强
- [x] 文章排序选择器（最新/最热/评论最多）
- [x] 搜索框（PC 端 + 移动端）
- [x] 响应式布局（移动端抽屉菜单）

### 3.10 用户留存
- [x] 最近阅读历史（localStorage，最多 20 条，首页展示）
- [x] 每日一言小组件（30+ 程序员名言，日期种子固定，可手动换一条）
- [x] 文章字体大小调节器（14-22px，localStorage 保存偏好）

### 3.11 面包屑导航
- [x] 文章详情页面包屑
- [x] 分类页面包屑
- [x] 标签页面包屑

### 3.12 开发者工具箱（/tools）
- [x] JSON 格式化（美化/压缩 + 语法高亮 + 复制）
- [x] Base64 编解码（双向实时转换）
- [x] 时间戳转换（实时时间戳 + 秒/毫秒级互转）
- [x] 颜色选择器（HEX/RGB/HSL 互转 + 可视化选择 + 快速复制）
- [x] Tab 切换式布局
- [x] 导航栏工具箱入口

### 3.13 SEO 优化
- [x] 各页面 SEO Meta（title / description / keywords）
- [x] Open Graph 标签
- [x] 文章详情 JSON-LD 结构化数据（BlogPosting）
- [x] 百度自动推送
- [x] sitemap.xml（后端动态生成）
- [x] robots.txt
- [x] HTTPS（Let's Encrypt）
- [x] 百度站长平台验证

### 3.14 性能优化
- [x] 代码分割（antd / react / markdown / syntax / particles 独立 chunk）
- [x] 粒子背景懒加载（首屏后加载 Three.js）
- [x] 关键 CSS 内联
- [x] chunk 加载失败自动重试
- [x] 预加载 umi.css
- [x] 后端统计接口缓存
- [x] 图片懒加载（loading="lazy"）
- [x] 首页 API 请求延迟（requestIdleCallback）
- [x] 滚动事件 RAF 节流
- [x] Hero 浮动粒子 useMemo 缓存
- [x] 构建产物 Hash 化 + Nginx 差异化缓存策略

---

## 四、技术约束

- 前端不引入额外 npm 依赖（除非必要评估通过）
- 移动端适配必须正常
- 保持现有功能不被破坏
- 代码风格与现有项目一致

---

## 五、技术架构摘要

### 前端
- Umi 4 + React 18 + TypeScript
- Ant Design 5 + Tailwind CSS
- 状态管理：Umi Model（基于 hooks）

### 后端
- Express + MongoDB（Mongoose）
- JWT 认证（admin / github 双类型）
- GitHub OAuth 2.0 授权码模式

### 部署
- GitHub Actions CI/CD
- rsync 文件同步
- pm2 进程管理
- Nginx 反向代理 + HTTPS（Let's Encrypt）
- Server酱微信通知

### 安全
- CSRF 防护（OAuth state 参数）
- JWT 类型隔离
- GitHub access_token 不暴露给前端
- URL 参数及时清理
- 封禁机制
- 最小权限 OAuth scope
