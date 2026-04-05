# 前端单元测试用例

> 覆盖工具函数、自定义 Hook、UI 组件的独立测试

---

## 一、工具函数（utils/）

### TASK-06：prefetch.ts — 文章预加载

#### FU-001：首次预加载文章应发起 fetch 请求

| 字段 | 内容 |
|------|------|
| **测试 ID** | FU-001 |
| **对应功能** | TASK-06 文章卡片悬停预加载 |
| **优先级** | P1 |
| **前置条件** | Mock `global.fetch`，返回 `{ code: 0, data: { _id: 'a1', title: 'Test' } }` |
| **测试步骤** | 1. 调用 `fetchArticleDetail('a1')`<br>2. 断言 `fetch` 被调用，URL 为 `/api/articles/a1`<br>3. 等待 Promise resolve<br>4. 调用 `getPrefetchedArticle('a1')`<br>5. 断言返回值等于 mock 数据 |
| **期望结果** | fetch 调用 1 次，`getPrefetchedArticle('a1')` 返回完整的文章数据对象 |

#### FU-002：重复预加载同一文章不应重复请求

| 字段 | 内容 |
|------|------|
| **测试 ID** | FU-002 |
| **对应功能** | TASK-06 文章卡片悬停预加载 |
| **优先级** | P1 |
| **前置条件** | Mock `global.fetch` |
| **测试步骤** | 1. 调用 `fetchArticleDetail('a1')`<br>2. 等待 Promise resolve<br>3. 再次调用 `fetchArticleDetail('a1')`<br>4. 断言 `fetch` 总共只被调用 1 次 |
| **期望结果** | 第二次调用不再发起网络请求，利用缓存直接返回 |

#### FU-003：预加载失败后清除缓存条目，允许重试

| 字段 | 内容 |
|------|------|
| **测试 ID** | FU-003 |
| **对应功能** | TASK-06 文章卡片悬停预加载 |
| **优先级** | P2 |
| **前置条件** | Mock `global.fetch`，让其 reject（模拟网络错误） |
| **测试步骤** | 1. 调用 `fetchArticleDetail('a1')`<br>2. 等待 Promise reject<br>3. 调用 `getPrefetchedArticle('a1')`，断言返回 `null`<br>4. 修改 mock 让 fetch 正常返回<br>5. 再次调用 `fetchArticleDetail('a1')`<br>6. 断言 `fetch` 被调用（第二次重试成功） |
| **期望结果** | 失败后缓存被清除，`getPrefetchedArticle` 返回 null，允许后续重试 |

---

### TASK-10：apiCache.ts — 接口缓存层

#### FU-004：setCache + getCache 基本存取

| 字段 | 内容 |
|------|------|
| **测试 ID** | FU-004 |
| **对应功能** | TASK-10 接口缓存层 |
| **优先级** | P0 |
| **前置条件** | 无 |
| **测试步骤** | 1. 调用 `setCache('key1', { foo: 'bar' }, 60000)`<br>2. 调用 `getCache('key1')`<br>3. 断言返回 `{ foo: 'bar' }` |
| **期望结果** | 缓存正常存取，返回原始数据 |

#### FU-005：过期缓存自动清除

| 字段 | 内容 |
|------|------|
| **测试 ID** | FU-005 |
| **对应功能** | TASK-10 接口缓存层 |
| **优先级** | P1 |
| **前置条件** | 使用 `jest.useFakeTimers()` |
| **测试步骤** | 1. 调用 `setCache('key1', 'data', 5000)`<br>2. `jest.advanceTimersByTime(4999)` → 调用 `getCache('key1')`，断言返回 `'data'`<br>3. `jest.advanceTimersByTime(2)` → 调用 `getCache('key1')`，断言返回 `null` |
| **期望结果** | TTL 内返回数据，过期后返回 null 并自动清理 |

#### FU-006：clearCache 按前缀批量清除

| 字段 | 内容 |
|------|------|
| **测试 ID** | FU-006 |
| **对应功能** | TASK-10 接口缓存层 |
| **优先级** | P1 |
| **前置条件** | 无 |
| **测试步骤** | 1. `setCache('articles:page1', [...], 60000)`<br>2. `setCache('articles:page2', [...], 60000)`<br>3. `setCache('tags:all', [...], 60000)`<br>4. 调用 `clearCache('articles')`<br>5. 断言 `getCache('articles:page1')` 返回 null<br>6. 断言 `getCache('articles:page2')` 返回 null<br>7. 断言 `getCache('tags:all')` 仍返回数据 |
| **期望结果** | 仅清除匹配前缀的缓存，其他缓存不受影响 |

#### FU-007：cachedRequest 缓存命中时不发起网络请求

| 字段 | 内容 |
|------|------|
| **测试 ID** | FU-007 |
| **对应功能** | TASK-10 接口缓存层 |
| **优先级** | P0 |
| **前置条件** | Mock umi 的 `request`，返回 `{ code: 0, data: [] }` |
| **测试步骤** | 1. 调用 `cachedRequest('/api/articles', { page: 1 }, 300000)`<br>2. 等待 resolve，断言 `request` 被调用 1 次<br>3. 再次调用相同参数的 `cachedRequest`<br>4. 断言 `request` 仍只被调用 1 次（命中缓存）<br>5. 断言第二次返回值与第一次相同 |
| **期望结果** | 首次请求后缓存数据，二次调用直接返回缓存，不重复请求 |

---

### TASK-11：recommend.ts — 推荐算法

#### FU-008：getReadArticleIds 从阅读历史返回已读 ID 集合

| 字段 | 内容 |
|------|------|
| **测试 ID** | FU-008 |
| **对应功能** | TASK-11 猜你喜欢推荐 |
| **优先级** | P1 |
| **前置条件** | Mock `getReadingHistory` 返回 `[{ articleId: 'a1' }, { articleId: 'a2' }, { articleId: 'a1' }]` |
| **测试步骤** | 1. 调用 `getReadArticleIds()`<br>2. 断言返回的 Set 包含 `'a1'` 和 `'a2'`<br>3. 断言 Set.size === 2（去重） |
| **期望结果** | 返回去重后的已读文章 ID 集合 |

#### FU-009：sortByPopularity 按浏览量降序排列

| 字段 | 内容 |
|------|------|
| **测试 ID** | FU-009 |
| **对应功能** | TASK-11 猜你喜欢推荐 |
| **优先级** | P1 |
| **前置条件** | 准备文章数组 `[{ _id: 'a1', views: 50 }, { _id: 'a2', views: 200 }, { _id: 'a3', views: 100 }]` |
| **测试步骤** | 1. 调用 `sortByPopularity(articles)`<br>2. 断言结果顺序为 `a2(200)` → `a3(100)` → `a1(50)`<br>3. 断言原数组未被修改（不改变原数组） |
| **期望结果** | 返回按 views 降序的新数组，原数组不变 |

---

### TASK-13：achievements.ts — 阅读成就

#### FU-010：checkAchievements 首次阅读触发"初来乍到"

| 字段 | 内容 |
|------|------|
| **测试 ID** | FU-010 |
| **对应功能** | TASK-13 阅读成就系统 |
| **优先级** | P1 |
| **前置条件** | Mock `getReadingHistory` 返回 1 条记录；localStorage 中无 `blog_achievements` |
| **测试步骤** | 1. 调用 `checkAchievements()`<br>2. 断言返回的 achievement.id === `'first_read'`<br>3. 断言 achievement.title === `'初来乍到'`<br>4. 检查 localStorage `blog_achievements` 已包含该成就 |
| **期望结果** | 返回 `first_read` 成就对象，localStorage 已持久化 |

#### FU-011：已解锁成就不重复触发

| 字段 | 内容 |
|------|------|
| **测试 ID** | FU-011 |
| **对应功能** | TASK-13 阅读成就系统 |
| **优先级** | P1 |
| **前置条件** | localStorage 中已存有 `first_read` 成就；Mock `getReadingHistory` 返回 1 条记录 |
| **测试步骤** | 1. 调用 `checkAchievements()`<br>2. 断言返回 `null`（不重复触发） |
| **期望结果** | 已解锁的成就不会再次返回 |

#### FU-012：连续阅读天数计算（calculateStreak 间接验证）

| 字段 | 内容 |
|------|------|
| **测试 ID** | FU-012 |
| **对应功能** | TASK-13 阅读成就系统 |
| **优先级** | P2 |
| **前置条件** | Mock `getReadingHistory` 返回今天和过去 2 天的记录（连续 3 天）；设置今天日期为基准 |
| **测试步骤** | 1. 调用 `getReadingStats()`<br>2. 断言 `streakDays === 3`<br>3. 修改 history：中间有一天中断<br>4. 再次调用，断言 `streakDays` 从中断日重新计算 |
| **期望结果** | 正确计算连续天数，中断后重新计数 |

---

## 二、自定义 Hooks

### TASK-14：useLightbox — 图片灯箱 Hook

#### FU-013：useLightbox 收集容器内图片并绑定点击

| 字段 | 内容 |
|------|------|
| **测试 ID** | FU-013 |
| **对应功能** | TASK-14 图片灯箱查看器 |
| **优先级** | P1 |
| **前置条件** | 渲染一个容器 `<div className="test-container">` 内含 3 个 `<img>` 标签 |
| **测试步骤** | 1. 调用 `useLightbox('.test-container', [])`<br>2. 等待 300ms useEffect 执行<br>3. 断言 `images` 数组长度为 3<br>4. 模拟点击第 2 个图片<br>5. 断言 `visible === true` 且 `currentIndex === 1` |
| **期望结果** | Hook 正确收集图片并响应点击事件打开灯箱 |

#### FU-014：useLightbox deps 变化时重新收集图片

| 字段 | 内容 |
|------|------|
| **测试 ID** | FU-014 |
| **对应功能** | TASK-14 图片灯箱查看器 |
| **优先级** | P2 |
| **前置条件** | 容器内初始 2 张图片 |
| **测试步骤** | 1. 调用 `useLightbox('.test-container', [articleId])`<br>2. 更新 deps（模拟文章切换），容器变为 4 张图片<br>3. 等待 300ms<br>4. 断言 `images` 数组长度变为 4 |
| **期望结果** | deps 变化后重新扫描容器，更新图片列表 |

#### FU-015：useLightbox close 关闭灯箱

| 字段 | 内容 |
|------|------|
| **测试 ID** | FU-015 |
| **对应功能** | TASK-14 图片灯箱查看器 |
| **优先级** | P1 |
| **前置条件** | 灯箱已打开（visible = true） |
| **测试步骤** | 1. 点击图片打开灯箱<br>2. 调用 `close()`<br>3. 断言 `visible === false` |
| **期望结果** | 调用 close 后灯箱关闭 |

---

### TASK-18：useSwipe — 滑动手势 Hook

#### FU-016：左滑触发 onSwipeLeft 回调

| 字段 | 内容 |
|------|------|
| **测试 ID** | FU-016 |
| **对应功能** | TASK-18 移动端滑动手势 |
| **优先级** | P1 |
| **前置条件** | 创建一个 div 并获取 ref，提供 `onSwipeLeft` mock 函数 |
| **测试步骤** | 1. 调用 `useSwipe(ref, { onSwipeLeft: mockFn })`<br>2. 模拟 touchstart (x: 200, y: 300)<br>3. 模拟 touchmove → touchend (x: 100, y: 300)（水平滑动 > 50px）<br>4. 断言 `mockFn` 被调用 |
| **期望结果** | 水平左滑超过阈值时触发回调 |

#### FU-017：右滑触发 onSwipeRight 回调

| 字段 | 内容 |
|------|------|
| **测试 ID** | FU-017 |
| **对应功能** | TASK-18 移动端滑动手势 |
| **优先级** | P1 |
| **前置条件** | 同 FU-016 |
| **测试步骤** | 1. 调用 `useSwipe(ref, { onSwipeRight: mockFn })`<br>2. 模拟 touchstart (x: 100, y: 300)<br>3. 模拟 touchmove → touchend (x: 200, y: 300)<br>4. 断言 `mockFn` 被调用 |
| **期望结果** | 水平右滑超过阈值时触发回调 |

#### FU-018：垂直滑动不触发回调

| 字段 | 内容 |
|------|------|
| **测试 ID** | FU-018 |
| **对应功能** | TASK-18 移动端滑动手势 |
| **优先级** | P1 |
| **前置条件** | 同 FU-016 |
| **测试步骤** | 1. 调用 `useSwipe(ref, { onSwipeLeft: mockLeft, onSwipeRight: mockRight })`<br>2. 模拟 touchstart (x: 200, y: 100)<br>3. 模拟 touchmove → touchend (x: 210, y: 300)（垂直滑动距离 > 水平距离）<br>4. 断言两个 mock 函数均未被调用 |
| **期望结果** | 垂直滑动被忽略，不误触发水平滑动回调 |

---

## 三、UI 组件

### TASK-07：GlobalSearch — 全局搜索浮层

#### FU-019：输入关键词 300ms 后触发搜索

| 字段 | 内容 |
|------|------|
| **测试 ID** | FU-019 |
| **对应功能** | TASK-07 全局搜索浮层 |
| **优先级** | P0 |
| **前置条件** | 渲染 `<GlobalSearch open={true} onClose={mockFn} />`，Mock `/api/articles` 接口 |
| **测试步骤** | 1. 在搜索 Input 中输入 "React"<br>2. 等待 200ms，断言请求未发出（防抖中）<br>3. 等待至 350ms<br>4. 断言 fetch 被调用，参数含 `keyword=React` |
| **期望结果** | 300ms 防抖后发起搜索请求 |

#### FU-020：无搜索词时显示历史记录

| 字段 | 内容 |
|------|------|
| **测试 ID** | FU-020 |
| **对应功能** | TASK-07 全局搜索浮层 |
| **优先级** | P2 |
| **前置条件** | localStorage 中设置 `search_history = ["React", "Vue", "TypeScript"]` |
| **测试步骤** | 1. 渲染 `<GlobalSearch open={true} onClose={mockFn} />`<br>2. 断言 Input 为空时，下方列表显示 "React"、"Vue"、"TypeScript" |
| **期望结果** | 空搜索词状态下展示搜索历史 |

#### FU-021：键盘上下箭头选择搜索结果

| 字段 | 内容 |
|------|------|
| **测试 ID** | FU-021 |
| **对应功能** | TASK-07 全局搜索浮层 |
| **优先级** | P1 |
| **前置条件** | 搜索结果有 3 条，输入关键词已触发搜索 |
| **测试步骤** | 1. 按下 `ArrowDown` 键，断言第 1 项高亮<br>2. 再按 `ArrowDown`，断言第 2 项高亮<br>3. 再按 `ArrowDown`，断言第 3 项高亮<br>4. 再按 `ArrowDown`，断言回到第 1 项（循环）<br>5. 按 `ArrowUp`，断言回到第 3 项（反向循环） |
| **期望结果** | 上下箭头正确切换高亮项，循环滚动 |

#### FU-022：Enter 键跳转搜索结果并写入历史

| 字段 | 内容 |
|------|------|
| **测试 ID** | FU-022 |
| **对应功能** | TASK-07 全局搜索浮层 |
| **优先级** | P1 |
| **前置条件** | 搜索结果有 2 条，第 1 项已高亮 |
| **测试步骤** | 1. 按 `Enter` 键<br>2. 断言 `window.location.pathname` 变为对应文章 URL<br>3. 检查 localStorage `search_history` 中追加了搜索关键词 |
| **期望结果** | 回车跳转到选中文章，关键词存入搜索历史 |

---

### TASK-08：Skeleton 骨架屏

#### FU-023：HomeSkeleton 渲染 5 个 section 区域

| 字段 | 内容 |
|------|------|
| **测试 ID** | FU-023 |
| **对应功能** | TASK-08 骨架屏精细化 |
| **优先级** | P2 |
| **前置条件** | 无 |
| **测试步骤** | 1. 渲染 `<HomeSkeleton />`<br>2. 查找所有 `skeleton-shimmer` class 元素<br>3. 断言至少存在 5 个不同区域（Hero / Featured / Latest / Explore / CTA） |
| **期望结果** | 骨架屏包含完整的 5 个 section 布局 |

#### FU-024：ArticleDetailSkeleton 渲染正文和侧栏区域

| 字段 | 内容 |
|------|------|
| **测试 ID** | FU-024 |
| **对应功能** | TASK-08 骨架屏精细化 |
| **优先级** | P2 |
| **前置条件** | 无 |
| **测试步骤** | 1. 渲染 `<ArticleDetailSkeleton />`<br>2. 查找 Hero 区域（标题骨架 + 作者信息骨架）<br>3. 查找正文区域（5 段内容骨架）<br>4. 查找 TOC 侧栏（目录项骨架）<br>5. 断言所有区域存在 |
| **期望结果** | 骨架屏包含 Hero、正文段落、TOC 侧栏等完整布局 |

---

### TASK-12：NotificationBell — 通知铃铛

#### FU-025：组件挂载时获取未读数

| 字段 | 内容 |
|------|------|
| **测试 ID** | FU-025 |
| **对应功能** | TASK-12 评论回复通知 |
| **优先级** | P0 |
| **前置条件** | Mock `/api/notifications/unread-count` 返回 `{ code: 0, data: { count: 3 } }` |
| **测试步骤** | 1. 渲染 `<NotificationBell />`<br>2. 等待 useEffect 执行<br>3. 断言 Bell 图标旁显示数字 "3"<br>4. 断言 Badge 组件存在 |
| **期望结果** | 挂载后正确显示未读通知数量 |

#### FU-026：点击"全部已读"后清空未读数

| 字段 | 内容 |
|------|------|
| **测试 ID** | FU-026 |
| **对应功能** | TASK-12 评论回复通知 |
| **优先级** | P1 |
| **前置条件** | 未读数 3，Mock `PUT /api/notifications/read-all` 返回成功 |
| **测试步骤** | 1. 点击铃铛图标打开 Popover<br>2. 点击"全部已读"按钮<br>3. 断言 API 调用 `PUT /api/notifications/read-all`<br>4. 断言未读数字消失 |
| **期望结果** | 调用全部已读 API 后，Badge 清零 |

#### FU-027：30 秒轮询刷新未读数

| 字段 | 内容 |
|------|------|
| **测试 ID** | FU-027 |
| **对应功能** | TASK-12 评论回复通知 |
| **优先级** | P2 |
| **前置条件** | Mock timer，`jest.useFakeTimers()` |
| **测试步骤** | 1. 渲染 `<NotificationBell />`<br>2. `jest.advanceTimersByTime(30000)`<br>3. 断言 unread-count API 被调用 2 次（初始 + 30s 轮询） |
| **期望结果** | 每 30 秒自动请求一次未读数 |

---

### TASK-14：Lightbox — 图片灯箱组件

#### FU-028：键盘 ESC 关闭灯箱

| 字段 | 内容 |
|------|------|
| **测试 ID** | FU-028 |
| **对应功能** | TASK-14 图片灯箱查看器 |
| **优先级** | P1 |
| **前置条件** | 渲染 `<Lightbox visible={true} images={['1.jpg', '2.jpg']} currentIndex={0} onClose={mockFn} onIndexChange={mockIndex} />` |
| **测试步骤** | 1. 触发 `keydown` 事件，key = `'Escape'`<br>2. 断言 `onClose` mock 被调用 |
| **期望结果** | ESC 键关闭灯箱 |

#### FU-029：左右箭头键切换图片

| 字段 | 内容 |
|------|------|
| **测试 ID** | FU-029 |
| **对应功能** | TASK-14 图片灯箱查看器 |
| **优先级** | P1 |
| **前置条件** | 同 FU-028，3 张图片，currentIndex = 1 |
| **测试步骤** | 1. 触发 `keydown` key = `'ArrowRight'`<br>2. 断言 `onIndexChange(2)` 被调用<br>3. 触发 `keydown` key = `'ArrowLeft'`<br>4. 断言 `onIndexChange(0)` 被调用 |
| **期望结果** | 方向键正确切换到对应索引 |

#### FU-030：鼠标滚轮缩放图片

| 字段 | 内容 |
|------|------|
| **测试 ID** | FU-030 |
| **对应功能** | TASK-14 图片灯箱查看器 |
| **优先级** | P2 |
| **前置条件** | 灯箱已打开，图片已渲染 |
| **测试步骤** | 1. 触发 `wheel` 事件 deltaY < 0（向上滚）<br>2. 断言图片 scale 增大（放大）<br>3. 触发 `wheel` 事件 deltaY > 0（向下滚）<br>4. 断言图片 scale 减小（缩小）<br>5. 连续放大至 > 3x，断言 scale 被限制为 3 |
| **期望结果** | 滚轮控制缩放，范围限制在 0.5x - 3x |

---

### TASK-16：SeriesNav — 系列导航组件

#### FU-031：渲染系列文章列表并高亮当前文章

| 字段 | 内容 |
|------|------|
| **测试 ID** | FU-031 |
| **对应功能** | TASK-16 文章系列/专栏 |
| **优先级** | P1 |
| **前置条件** | Mock `/api/series/s1/articles` 返回 3 篇文章列表（按 seriesOrder 排序） |
| **测试步骤** | 1. 渲染 `<SeriesNav seriesId="s1" seriesTitle="React 入门" currentArticleId="a2" />`<br>2. 断言显示系列标题 "React 入门"<br>3. 断言列表有 3 项<br>4. 断言 "a2" 对应项有高亮样式 |
| **期望结果** | 正确展示系列列表，当前文章高亮 |

#### FU-032：上一篇/下一篇导航按钮

| 字段 | 内容 |
|------|------|
| **测试 ID** | FU-032 |
| **对应功能** | TASK-16 文章系列/专栏 |
| **优先级** | P1 |
| **前置条件** | 同 FU-031 |
| **测试步骤** | 1. 断言第一篇文章的"上一篇"按钮不可用或隐藏<br>2. 断言最后一篇文章的"下一篇"按钮不可用或隐藏<br>3. 点击当前第 2 篇的"下一篇"<br>4. 断言跳转到第 3 篇文章 URL |
| **期望结果** | 上一篇/下一篇正确导航，首尾文章按钮边界处理正确 |

#### FU-033：系列不存在时组件不渲染

| 字段 | 内容 |
|------|------|
| **测试 ID** | FU-033 |
| **对应功能** | TASK-16 文章系列/专栏 |
| **优先级** | P2 |
| **前置条件** | Mock API 返回 404 |
| **测试步骤** | 1. 渲染 `<SeriesNav seriesId="invalid" currentArticleId="a1" />`<br>2. 断言组件渲染为 null 或空 |
| **期望结果** | 系列不存在时组件优雅降级 |

---

### TASK-17：OptimizedImage — 优化图片组件

#### FU-034：有 WebP 源时生成 picture + source 标签

| 字段 | 内容 |
|------|------|
| **测试 ID** | FU-034 |
| **对应功能** | TASK-17 WebP 图片优化 |
| **优先级** | P1 |
| **前置条件** | 无 |
| **测试步骤** | 1. 渲染 `<OptimizedImage src="img.jpg" webpSrc="img.webp" alt="测试图片" />`<br>2. 查找 `<picture>` 标签<br>3. 查找 `<source>` 标签，断言 `srcSet="img.webp"` 且 `type="image/webp"`<br>4. 查找 `<img>` 标签，断言 `src="img.jpg"` |
| **期望结果** | 生成正确的 picture 结构，浏览器优先加载 WebP |

#### FU-035：无 WebP 源时仅渲染 img 标签

| 字段 | 内容 |
|------|------|
| **测试 ID** | FU-035 |
| **对应功能** | TASK-17 WebP 图片优化 |
| **优先级** | P2 |
| **前置条件** | 无 |
| **测试步骤** | 1. 渲染 `<OptimizedImage src="img.jpg" alt="测试图片" />`<br>2. 断言无 `<source type="image/webp">` 标签<br>3. 断言 `<img>` 的 `src="img.jpg"` |
| **期望结果** | 无 WebP 时正常显示原图 |

---

### TASK-18：MobileTabBar — 移动端底部导航

#### FU-036：根据当前路由高亮对应 Tab

| 字段 | 内容 |
|------|------|
| **测试 ID** | FU-036 |
| **对应功能** | TASK-18 移动端底部导航栏 |
| **优先级** | P1 |
| **前置条件** | Mock `useLocation` 返回 `{ pathname: '/articles' }` |
| **测试步骤** | 1. 渲染 `<MobileTabBar />`<br>2. 查找所有 tab 项<br>3. 断言"文章"tab 有高亮样式<br>4. 断言其他 tab 无高亮样式 |
| **期望结果** | 当前路由匹配的 tab 正确高亮 |

#### FU-037：点击 Tab 跳转到对应路由

| 字段 | 内容 |
|------|------|
| **测试 ID** | FU-037 |
| **对应功能** | TASK-18 移动端底部导航栏 |
| **优先级** | P1 |
| **前置条件** | Mock `useNavigate` |
| **测试步骤** | 1. 渲染 `<MobileTabBar />`<br>2. 点击"分类"tab<br>3. 断言 navigate 被调用，路径为 `/categories` |
| **期望结果** | 点击 tab 正确导航到对应页面 |

---

### TASK-19：ArticleCard — React.memo 优化

#### FU-038：相同 props 不触发重渲染

| 字段 | 内容 |
|------|------|
| **测试 ID** | FU-038 |
| **对应功能** | TASK-19 组件渲染优化 |
| **优先级** | P1 |
| **前置条件** | 准备固定的 article 对象和 style 对象 |
| **测试步骤** | 1. 渲染 `<ArticleCard article={article} style={style} />`<br>2. 使用相同的 props 重新渲染<br>3. 使用 renderCount 追踪（或 React DevTools Profiler）<br>4. 断言组件渲染次数为 1（React.memo 生效） |
| **期望结果** | props 不变时组件跳过重渲染 |

#### FU-039：article prop 变化时触发重渲染

| 字段 | 内容 |
|------|------|
| **测试 ID** | FU-039 |
| **对应功能** | TASK-19 组件渲染优化 |
| **优先级** | P1 |
| **前置条件** | 同 FU-038 |
| **测试步骤** | 1. 渲染 `<ArticleCard article={article1} />`<br>2. 更新为 `<ArticleCard article={article2} />`（不同的 article 对象）<br>3. 断言组件重渲染，显示新的文章标题 |
| **期望结果** | props 变化时组件正确重渲染 |

#### FU-040：鼠标悬停触发 fetchArticleDetail

| 字段 | 内容 |
|------|------|
| **测试 ID** | FU-040 |
| **对应功能** | TASK-06 + TASK-19 文章卡片悬停预加载 |
| **优先级** | P0 |
| **前置条件** | Mock `fetchArticleDetail` 函数 |
| **测试步骤** | 1. 渲染 `<ArticleCard article={article} />`<br>2. 触发 Link 的 `mouseEnter` 事件<br>3. 断言 `fetchArticleDetail` 被调用，参数为 `article._id` |
| **期望结果** | 鼠标悬停时调用预加载函数 |

---

### TASK-13：ReadingStats — 阅读统计面板

#### FU-041：显示正确的统计数据

| 字段 | 内容 |
|------|------|
| **测试 ID** | FU-041 |
| **对应功能** | TASK-13 阅读成就系统 |
| **优先级** | P2 |
| **前置条件** | Mock `getReadingStats` 返回 `{ totalArticles: 15, streakDays: 4, lastReadDate: '2026-04-05' }`；Mock `getUnlockedAchievements` 返回 2 个已解锁成就 |
| **测试步骤** | 1. 渲染 `<ReadingStatsModal open={true} onClose={mockFn} />`<br>2. 断言显示 "15" 篇已读文章<br>3. 断言显示 "4" 天连续阅读<br>4. 断言成就列表显示 6 个里程碑，其中 2 个为已解锁状态 |
| **期望结果** | 面板正确展示阅读统计和成就解锁状态 |

#### FU-042：关闭按钮触发 onClose

| 字段 | 内容 |
|------|------|
| **测试 ID** | FU-042 |
| **对应功能** | TASK-13 阅读成就系统 |
| **优先级** | P2 |
| **前置条件** | Modal 已打开 |
| **测试步骤** | 1. 渲染 `<ReadingStatsModal open={true} onClose={mockFn} />`<br>2. 点击关闭按钮或按 ESC<br>3. 断言 `onClose` 被调用 |
| **期望结果** | 关闭操作正确触发回调 |
