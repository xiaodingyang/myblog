# 博客访客统计功能 PRD

## 一、功能清单

### 1.1 前端埋点 SDK
- 自动记录页面访问（PV）
- 采集访客基础信息（IP、User-Agent、Referer）
- 记录页面路径、停留时长
- 支持单页应用路由切换监听
- **防重复提交（三层去重机制）**：
  - **第 1 层：pathname 对比** — 过滤 URL 没变的情况（如 query 参数变化）
  - **第 2 层：时间间隔（5 分钟）** — 同一页面短时间内不重复计数
  - **第 3 层：防抖（50ms）** — 合并同一时刻的多次触发（避免 pushState + popstate 同时触发）

### 1.2 后端统计 API
- 接收并存储访问记录
- 提供统计数据查询接口
- 支持按时间范围、页面路径筛选
- 计算 PV、UV、热门页面、访问趋势

### 1.3 后台统计页面
- 总览数据卡片（今日/昨日/本周/本月 PV/UV）
- 访问趋势图表（折线图，最近 7/30 天）
- 热门页面排行（表格，Top 10）
- 访客来源分析（饼图，Referer 域名分布）
- 访问记录列表（表格，支持分页和筛选）

---

## 二、数据模型

### Visit 访问记录表（MongoDB Collection）

```javascript
{
  _id: ObjectId,              // MongoDB 自动生成
  path: String,               // 访问路径，如 "/blog/123"
  title: String,              // 页面标题
  referer: String,            // 来源页面 URL
  userAgent: String,          // 浏览器 User-Agent
  ip: String,                 // 访客 IP 地址
  sessionId: String,          // 会话 ID（前端生成，用于 UV 统计）
  timestamp: Date,            // 访问时间戳
  duration: Number,           // 停留时长（秒），可选
  createdAt: Date,            // 记录创建时间（索引）
}
```

**索引设计**：
- `createdAt`（降序）：按时间查询
- `path`：按页面路径统计
- `sessionId`：UV 去重
- `{ path: 1, createdAt: -1 }`（复合索引）：按页面 + 时间范围联合查询

**查询性能优化策略**：

| 优先级 | 方式 | 时机 | 说明 |
|--------|------|------|------|
| P0 | 索引 | 建表时 | 上述索引，查询从秒级→毫秒级 |
| P0 | 投影（Projection） | 写 API 时 | 只查需要的字段，不返回 userAgent 等大字段 |
| P0 | 分页 | 已设计 | 每页 20 条，避免一次返回全量数据 |
| P1 | 内存缓存 | 上线后按需 | 概览/热门/趋势接口加缓存（1-5 分钟过期），减少重复查询 |
| P1 | 聚合预计算 | 数据量上万后 | 每日定时任务汇总当天 PV/UV 到 `daily_stats` 集合，趋势查询直读汇总表 |
| P2 | 游标分页 | 数据量上十万后 | 用 `_id` 游标替代 `skip/limit`，深页翻页性能恒定 |
| P3 | 数据归档 | 数据量上百万后 | 3 个月前的记录迁移到 `visits_archive`，保持主表轻量 |

> P0 在初始开发时顺手完成；P1、P2、P3 随流量增长按需迭代，不提前过度优化。

### DailyStats 每日汇总表（P1 阶段创建）

> 数据量上万后启用，由每日凌晨定时任务写入，趋势查询直读此表。

```javascript
{
  _id: ObjectId,
  date: String,               // 日期，如 "2026-04-05"
  path: String,               // 页面路径（全站汇总时为 null）
  pv: Number,                 // 当日页面浏览量
  uv: Number,                 // 当日独立访客数（按 sessionId 去重）
}
```

**索引设计**：
- `{ date: -1 }`：按日期降序查询趋势
- `{ date: -1, path: 1 }`（复合索引）：按日期 + 页面查询单页趋势

---

## 三、API 接口设计

### 统一响应格式
所有接口使用统一的响应结构：
```json
// 成功
{ "code": 0, "data": { ... }, "message": "ok" }

// 失败 — 参数校验错误
{ "code": 400, "message": "参数 range 不合法，可选值：today | yesterday | week | month" }

// 失败 — 服务器内部错误
{ "code": 500, "message": "服务器内部错误" }
```

**错误码约定**：
| code | 含义 | 说明 |
|------|------|------|
| 0 | 成功 | 正常返回 |
| 400 | 参数错误 | 缺少必填参数或参数值不合法 |
| 401 | 未授权 | 后台统计页面接口需要管理员登录 |
| 500 | 服务器错误 | 数据库异常等内部错误，不暴露具体原因 |

### 3.1 记录访问
**POST** `/api/stats/visit`（无需登录，任何访客均可触发）

**请求体**：
```json
{
  "path": "/blog/123",
  "title": "文章标题",
  "referer": "https://google.com",
  "sessionId": "uuid-v4-string"
}
```

**响应**：
```json
{
  "code": 0,
  "message": "记录成功"
}
```

---

### 3.2 获取统计概览
**GET** `/api/stats/overview`（需要管理员登录）

**查询参数**：
- `range`: `today` | `yesterday` | `week` | `month`（默认 `today`）

> `week` 从周一 00:00:00 开始计算（北京时间 Asia/Shanghai）。所有时间范围均以北京时间为准。

**响应**：
```json
{
  "code": 0,
  "data": {
    "pv": 1234,
    "uv": 567,
    "avgDuration": 120
  }
}
```

---

### 3.3 获取访问趋势
**GET** `/api/stats/trend`（需要管理员登录）

**查询参数**：
- `days`: 7 | 30（默认 7）

**响应**：
```json
{
  "code": 0,
  "data": {
    "dates": ["2026-04-01", "2026-04-02"],
    "pv": [100, 120],
    "uv": [50, 60]
  }
}
```

---

### 3.4 获取热门页面
**GET** `/api/stats/top-pages`（需要管理员登录）

**查询参数**：
- `limit`: 数量限制（默认 10）
- `range`: 时间范围（同 overview）

**响应**：
```json
{
  "code": 0,
  "data": [
    { "path": "/blog/123", "title": "文章标题", "pv": 500, "uv": 200 }
  ]
}
```

---

### 3.5 获取访客来源分布
**GET** `/api/stats/referers`（需要管理员登录）

**查询参数**：
- `limit`: 来源数量限制（默认 5，超出部分合并为"其他"）
- `range`: 时间范围（同 overview）

**响应**：
```json
{
  "code": 0,
  "data": [
    { "source": "baidu.com", "count": 400 },
    { "source": "google.com", "count": 250 },
    { "source": "直接访问", "count": 200 },
    { "source": "weibo.com", "count": 100 },
    { "source": "github.com", "count": 80 },
    { "source": "其他", "count": 150 }
  ]
}
```

> `source` 从 referer URL 中提取域名；referer 为空时归类为"直接访问"。

---

### 3.6 获取访问记录列表
**GET** `/api/stats/visits`（需要管理员登录）

**查询参数**：
- `page`: 页码（默认 1）
- `pageSize`: 每页数量（默认 20）
- `path`: 筛选路径（可选）
- `startDate`: 开始日期（可选）
- `endDate`: 结束日期（可选）

**响应**：
```json
{
  "code": 0,
  "data": {
    "total": 1000,
    "page": 1,
    "pageSize": 20,
    "data": [
      {
        "_id": "...",
        "path": "/blog/123",
        "title": "文章标题",
        "ip": "192.168.1.1",
        "referer": "https://google.com",
        "timestamp": "2026-04-06T05:30:00.000Z"
      }
    ]
  }
}
```

---

## 四、前端页面设计

### 4.0 文件位置与现有代码说明

#### 后端（Express）
| 用途 | 文件路径 | 说明 |
|------|---------|------|
| 数据模型 | `backend/src/models/Visit.js` | 已存在，需改造（见下方字段映射） |
| 路由 | `backend/src/routes/stats.js` | 已存在，需补充 referers、visits 路由 |
| 控制器 | `backend/src/controllers/visitController.js` | 已存在，需补充新接口逻辑 |

#### 前端（React + Umi）
| 用途 | 文件路径 | 说明 |
|------|---------|------|
| 埋点 SDK | `frontend/src/utils/analytics.ts` | 已存在，需按三层去重方案重写 |
| SDK 初始化 | `frontend/src/layouts/FrontLayout.tsx` | 在前台布局组件的 useEffect 中初始化，全局生效 |
| 统计页面 | `frontend/src/pages/admin/stats/index.tsx` | 已存在，需按 PRD 重写 |
| Canvas 图表组件 | `frontend/src/components/TrendChart/index.tsx` | 新建 |

#### 现有模型字段映射（Visit.js 改造）
现有代码与 PRD 的字段名差异，开发时需统一：

| PRD 字段名 | 现有代码字段名 | 处理方式 |
|-----------|--------------|---------|
| `path` | `url` | 重命名为 `path`，只存路径不存完整 URL |
| `referer` | `referrer` | 重命名为 `referer`（与 HTTP 标准一致） |
| `duration` | 不存在 | 新增，可选字段 |

> 现有模型已有 `userId` 字段（已登录用户关联），PRD 未列出但应保留，不删除。

#### 饼图组件选型
区域 4 访客来源饼图使用 `@ant-design/charts` 的 `Pie` 组件（项目已安装），不做 Canvas 自定义。

### 4.1 统计后台页面路由
`/admin/stats`

### 4.2 页面布局（从上到下）

#### 区域 1：数据卡片行
- 4 个卡片并排（Ant Design `Statistic` 组件）
- 今日 PV | 今日 UV | 昨日 PV | 昨日 UV
- 支持切换时间范围（今日/昨日/本周/本月）

#### 区域 2：访问趋势图表（自定义 Canvas 方案）

**设计目标**：与博客玻璃拟态 + 粒子动效风格统一，打造沉浸式数据可视化体验。

**视觉规格**：
- 基于 Canvas 手绘曲线，带发光描边（glow effect），类似霓虹灯丝带效果
- 曲线下方渐变面积填充，颜色跟随当前主题色（从 `colorModel` 读取），从 `rgba(主题色, 0.3)` 渐变到透明
- 数据点为小光球，静态时有微弱呼吸脉冲动画（scale 0.95↔1.05，周期 2s）
- Hover 数据点时扩散涟漪效果（圆环从中心向外扩散 + 淡出）
- 背景层有微弱粒子流动（复用 tsparticles，低密度、慢速、小粒径，不抢主体）
- 图表容器为毛玻璃卡片（`backdrop-filter: blur(12px)` + 半透明白底 + 噪点纹理）
- Tooltip 为毛玻璃浮层，跟随鼠标，显示日期 + PV + UV

**交互规格**：
- X 轴：日期，Y 轴：PV/UV，双曲线（PV 主题色，UV 主题色淡化版）
- 支持切换 7 天 / 30 天
- 入场动画：曲线从左到右"画出"（stroke-dashoffset 动画），数据点依次弹出
- 切换时间范围时，旧曲线淡出 + 新曲线画入，过渡自然
- 主题色切换时，图表颜色平滑过渡（transition 0.8s）

**分批迭代计划**：
- **P0（基础可用）**：Canvas 绑定、坐标系绘制、平滑曲线渲染、渐变面积填充、主题色联动
- **P1（核心动效）**：曲线描边发光、入场画线动画、数据点呼吸脉冲、hover 涟漪扩散
- **P2（氛围层）**：背景粒子流动、毛玻璃 tooltip、时间范围切换过渡动画
- **P3（打磨）**：响应式适配、触屏手势支持、性能优化（离屏 Canvas / requestAnimationFrame 节流）

#### 区域 3：热门页面排行
- 表格（Ant Design `Table`）
- 列：排名、页面路径、标题、PV、UV
- 默认显示 Top 10

#### 区域 4：访客来源分析
- 饼图（Referer 域名分布）
- 显示前 5 个来源 + 其他

#### 区域 5：访问记录列表
- 表格（支持分页）
- 列：时间、页面路径、标题、IP、来源
- 支持按路径、时间范围筛选

---

## 五、验收标准

### 5.1 前端埋点 SDK
- [ ] 页面加载时自动发送访问记录
- [ ] 单页应用路由切换时触发记录（监听 `popstate` + 劫持 `pushState/replaceState`）
- [ ] **防重复提交机制**：
  - [ ] `replaceState` 只在 pathname 真正变化时上报（避免 query 参数变化误触发）
  - [ ] 同一页面 5 分钟内不重复计数（基于 `lastVisitTime` 判断）
  - [ ] 50ms 防抖，合并同一时刻的多次触发
- [ ] 网络失败时不影响页面正常使用（静默失败）

### 5.2 后端 API
- [ ] 所有接口响应时间 < 500ms（正常负载）
- [ ] 访问记录成功存储到 MongoDB
- [ ] UV 统计准确（基于 sessionId 去重）
- [ ] 支持按时间范围查询（今日/昨日/本周/本月）

### 5.3 后台统计页面
- [ ] 数据卡片实时显示当前统计数据
- [ ] 趋势图表正确渲染最近 7/30 天数据
- [ ] 趋势图表入场动画正常播放（曲线从左到右画出，数据点依次弹出）
- [ ] 趋势图表数据点 hover 时显示涟漪效果和毛玻璃 tooltip
- [ ] 趋势图表切换主题色时颜色平滑过渡
- [ ] 热门页面排行按 PV 降序显示
- [ ] 来源饼图正确显示前 5 个来源 + 其他
- [ ] 访问记录列表支持分页和筛选
- [ ] 筛选操作后分页自动重置为第 1 页
- [ ] 页面加载时间 < 2s
- [ ] API 请求失败时显示错误提示和重试按钮，不白屏

### 5.4 数据准确性
- [ ] PV 统计与实际访问次数一致
- [ ] UV 统计与独立访客数一致（误差 < 5%）
- [ ] 时间范围筛选结果准确

### 5.5 兼容性
- [ ] 支持主流浏览器（Chrome、Firefox、Safari、Edge 最新版）
- [ ] 移动端访问正常记录

---

## 六、技术实现细节

### 6.1 防重复计数实现

#### 问题分析
SPA 单页应用中，URL 变化有三种情况，但并非所有变化都应该计数：

| 触发方式 | 是否应该计数 | 潜在问题 |
|---------|------------|---------|
| `popstate`（前进/后退） | ✅ 是 | 可能与 `pushState` 同时触发 |
| `pushState`（代码跳转） | ✅ 是 | pathname 真正变化才算 |
| `replaceState`（替换历史） | ⚠️ 视情况 | 常用于更新 query 参数，pathname 未变不应计数 |

#### 三层去重机制

**第 1 层：pathname 对比**
```typescript
let lastPath = location.pathname;

history.replaceState = (...args) => {
  originalReplaceState.apply(window.history, args);
  if (location.pathname !== lastPath) {
    lastPath = location.pathname;
    this.trackPageView();
  }
};
```

**第 2 层：时间间隔（5 分钟）**
```typescript
private lastVisitTime: number = 0;
private readonly VISIT_INTERVAL: number = 5 * 60 * 1000;

public trackPageView(): void {
  const now = Date.now();
  const currentPath = window.location.pathname;

  if (currentPath === this.lastPath && now - this.lastVisitTime < this.VISIT_INTERVAL) {
    return; // 同一页面 5 分钟内不重复上报
  }

  this.lastPath = currentPath;
  this.lastVisitTime = now;
  // ... 上报逻辑
}
```

**第 3 层：防抖（50ms）**
```typescript
private debounceTimer: number | null = null;

public trackPageView(): void {
  if (this.debounceTimer) {
    clearTimeout(this.debounceTimer);
  }

  this.debounceTimer = window.setTimeout(() => {
    this.doTrackPageView(); // 真正的上报逻辑
  }, 50);
}
```

### 6.2 SessionId 生成与管理

```typescript
private getOrCreateSessionId(): string {
  const storageKey = 'visitor_session_id';
  let sessionId = localStorage.getItem(storageKey);

  if (!sessionId) {
    sessionId = `${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    localStorage.setItem(storageKey, sessionId);
  }

  return sessionId;
}
```

**特点**：
- 存储在 `localStorage`，浏览器关闭后仍保留
- 用于 UV 统计（同一 sessionId 算一个独立访客）
- 清除浏览器数据后会重新生成

### 6.3 访问趋势图表 — 自定义 Canvas 实现

#### 技术选型
不使用 @ant-design/charts 或 ECharts，改为 Canvas 2D API 手绘，原因：
- 完全控制渲染细节（发光描边、涟漪动效等图表库难以实现）
- 与博客现有的玻璃拟态 + 粒子风格深度统一
- 减少第三方图表库体积（趋势图是唯一需要图表的地方）

#### 核心技术点

**1. 平滑曲线算法**
使用 Catmull-Rom 样条插值，将离散数据点连成平滑曲线：
```typescript
// 将数据点转换为 Canvas 路径
// Catmull-Rom → Bezier 控制点转换
// 比简单的 bezierCurveTo 更自然，曲线一定经过每个数据点
```

**2. 发光描边（Glow Effect）**
多层叠加实现霓虹灯效果：
```typescript
// 第 1 层：宽模糊线（shadowBlur: 20, 低透明度）→ 外发光
// 第 2 层：中等模糊线（shadowBlur: 10）→ 中间过渡
// 第 3 层：细实线（lineWidth: 2）→ 核心线条
// 颜色从 colorModel 读取当前主题色
```

**3. 渐变面积填充**
曲线下方到 X 轴的封闭区域，填充线性渐变：
```typescript
// createLinearGradient(0, topY, 0, bottomY)
// addColorStop(0, `rgba(主题色, 0.3)`)
// addColorStop(1, `rgba(主题色, 0)`)
```

**4. 数据点呼吸脉冲**
requestAnimationFrame 驱动，每个数据点的半径在 4px↔5px 之间正弦波动：
```typescript
// radius = baseRadius + Math.sin(time * 0.003) * 1
// 每个点相位错开，避免同步跳动
```

**5. Hover 涟漪扩散**
鼠标靠近数据点时（距离 < 20px），触发涟漪：
```typescript
// 圆环从 r=5 扩散到 r=30，同时 opacity 从 0.6 → 0
// 使用 globalCompositeOperation = 'lighter' 叠加发光
```

**6. 入场画线动画**
利用 lineDashOffset 模拟"画出"效果：
```typescript
// 计算曲线总长度
// 初始 lineDashOffset = totalLength（完全隐藏）
// 动画过程中 lineDashOffset → 0（逐渐显示）
// 缓动函数：easeOutCubic，前快后慢，更自然
```

**7. 主题色联动**
监听 colorModel 变化，平滑过渡图表颜色：
```typescript
// useModel('colorModel') 获取当前主题色
// 颜色变化时不重绘，而是在 render loop 中插值过渡
// lerp(oldColor, newColor, progress) 实现 0.8s 平滑过渡
```

**8. 背景粒子层**
复用项目已有的 tsparticles，独立配置：
```typescript
// 粒子数量：15-20（低密度）
// 粒径：1-2px
// 速度：0.3（慢速漂浮）
// 颜色：主题色 20% 透明度
// 连线：关闭（避免干扰数据曲线）
```

#### 性能保障
- Canvas 绑定 `devicePixelRatio` 实现高清渲染
- requestAnimationFrame 统一驱动所有动画，非活动标签页自动暂停
- 数据点 hover 检测使用空间索引（数据量小时直接遍历即可）
- 组件卸载时清理 animation frame 和事件监听，防止内存泄漏
- P3 阶段考虑离屏 Canvas 双缓冲优化

### 6.4 查询性能优化实现

#### P0：投影（写 API 时默认执行）
所有查询只返回当前接口需要的字段，避免传输冗余数据：
```javascript
// ❌ 返回全部字段（userAgent 一条几百字节）
db.visits.find({ createdAt: { $gte: startDate } })

// ✅ 只返回需要的字段
db.visits.find(
  { createdAt: { $gte: startDate } },
  { path: 1, title: 1, timestamp: 1, sessionId: 1 }  // 按接口需求裁剪
)
```

#### P1：内存缓存（上线后按需添加）
对高频且容忍短暂延迟的接口加缓存：
```javascript
// 缓存策略
// GET /api/stats/overview   → 缓存 1 分钟（实时性要求稍高）
// GET /api/stats/top-pages  → 缓存 5 分钟（排名变化慢）
// GET /api/stats/trend      → 缓存 10 分钟（按天统计，变化更慢）

// 最简实现：Node.js 内存 Map + TTL，无需引入 Redis
const cache = new Map();
function getWithCache(key, ttlMs, queryFn) {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.time < ttlMs) return cached.data;
  const data = queryFn();
  cache.set(key, { data, time: Date.now() });
  return data;
}
```

#### P1：聚合预计算（数据量上万后添加）
每日凌晨定时任务，将前一天的原始记录汇总到 `daily_stats` 集合：
```javascript
// daily_stats 集合结构
{
  date: "2026-04-05",        // 日期
  path: "/blog/123",         // 页面路径（可选，全站汇总时为 null）
  pv: 42,                    // 当日 PV
  uv: 28,                    // 当日 UV（按 sessionId 去重）
}

// 趋势查询从扫描几万条原始记录 → 读取 30 条汇总记录
```

#### P2：游标分页（数据量上十万后替换）
访问记录列表接口从 `skip/limit` 切换为基于 `_id` 的游标分页：
```javascript
// 前端传上一页最后一条的 _id 作为游标
// GET /api/stats/visits?cursor=507f1f77bcf86cd799439011&pageSize=20

db.visits
  .find({ _id: { $lt: ObjectId(cursor) } })
  .sort({ _id: -1 })
  .limit(20)
// 无论翻到第几页，查询时间恒定
```

### 6.5 性能注意事项

> ⚠️ 以下为开发时必须遵守的性能规范，按模块分类。

#### 一、SDK 埋点层

**1. 不阻塞首屏渲染**
SDK 初始化必须在页面渲染完成后执行（`useEffect` 内），禁止在模块顶层同步初始化。
```typescript
// ✅ 渲染完成后初始化
useEffect(() => {
  const sdk = new Analytics();
  sdk.trackPageView();
}, []);
```

**2. 使用 sendBeacon 发送数据**
访问记录上报使用 `navigator.sendBeacon` 替代 `fetch`，不等待响应、不阻塞页面、页面关闭时也能发出。注意：必须用 `Blob` 包裹并指定 `application/json`，否则后端 `express.json()` 无法解析。
```typescript
const blob = new Blob(
  [JSON.stringify(data)],
  { type: 'application/json' }
);
navigator.sendBeacon('/api/stats/visit', blob);
```

**3. 事件监听器必须清理**
组件卸载时移除所有事件监听（popstate、pushState 劫持等），防止监听器累积导致内存泄漏和重复触发。
```typescript
useEffect(() => {
  window.addEventListener('popstate', handler);
  return () => window.removeEventListener('popstate', handler);
}, []);
```

#### 二、Canvas 趋势图层

**4. 每帧绘制时间 < 16ms**
屏幕 60Hz 刷新，每帧预算 16.6ms。当前数据量（7-30 个点）预估每帧 3-4ms，无压力。但需避免以下写法拉高帧耗时。

**5. 禁止在动画循环内创建对象**
渐变、路径等对象在数据变化时创建一次，动画循环内复用。避免每帧触发垃圾回收造成卡顿。
```typescript
// ❌ 每帧新建
function draw() {
  const gradient = ctx.createLinearGradient(...);
}

// ✅ 创建一次，循环内复用
const gradient = ctx.createLinearGradient(...);
function draw() {
  ctx.fillStyle = gradient;
}
```

**6. 页面不可见时暂停动画**
监听 `visibilitychange`，标签页切到后台时停止 `requestAnimationFrame`，切回来时恢复。减少 CPU 和电量消耗。

**7. Canvas 高清屏适配**
根据 `devicePixelRatio` 设置画布实际像素和 CSS 显示尺寸，防止 Retina 屏模糊。
```typescript
const dpr = window.devicePixelRatio || 1;
canvas.width = displayWidth * dpr;
canvas.height = displayHeight * dpr;
canvas.style.width = displayWidth + 'px';
canvas.style.height = displayHeight + 'px';
ctx.scale(dpr, dpr);
```

**8. 组件卸载时清理动画资源**
`cancelAnimationFrame` + 移除 mousemove/visibilitychange 等监听器，防止组件销毁后动画仍在执行。

#### 三、后台统计页面层

**9. API 请求必须并行**
页面加载时 5 个接口（概览、趋势、热门、来源、记录列表）使用 `Promise.allSettled` 并行请求，总耗时 = 最慢的那个，而非累加。单个接口失败不影响其他区域（详见 6.6 错误处理规范）。
```typescript
// ❌ 串行：750ms
const overview = await request('/api/stats/overview');
const trend = await request('/api/stats/trend');

// ✅ 并行：200ms，且单个失败不影响其他
const results = await Promise.allSettled([
  request('/api/stats/overview'),
  request('/api/stats/trend'),
  request('/api/stats/top-pages'),
  request('/api/stats/referers'),
  request('/api/stats/visits'),
]);
```

**10. 筛选后重置分页**
用户输入筛选条件后，页码必须重置为第 1 页。否则筛选结果不足当前页码时会显示空数据。

#### 四、性能检查清单

| # | 检查项 | 模块 | 必须 |
|---|--------|------|------|
| 1 | SDK 在 useEffect 内初始化，不阻塞首屏 | SDK | ✅ |
| 2 | 使用 sendBeacon 上报，不用 fetch 等待响应 | SDK | ✅ |
| 3 | 组件卸载时清理所有事件监听器 | SDK | ✅ |
| 4 | Canvas 动画循环内无对象创建 | Canvas | ✅ |
| 5 | 页面不可见时暂停 rAF | Canvas | ✅ |
| 6 | Canvas 适配 devicePixelRatio | Canvas | ✅ |
| 7 | 组件卸载时 cancelAnimationFrame | Canvas | ✅ |
| 8 | 统计页 API 使用 Promise.all 并行 | 页面 | ✅ |
| 9 | 筛选操作后分页重置为第 1 页 | 页面 | ✅ |
| 10 | 统计页完整加载时间 < 2s | 页面 | ✅ |

### 6.6 错误处理规范

#### 前端 SDK（博客前台）
- 所有上报请求使用 `try/catch` 包裹，捕获后静默丢弃，不弹提示、不影响页面
- `sendBeacon` 返回 `false` 时不重试（说明浏览器队列满，属于极端情况）

#### 后端 API
- 参数校验失败返回 `code: 400` + 具体原因（如"参数 range 不合法"）
- 数据库异常返回 `code: 500` + 通用提示，不暴露内部错误栈
- 记录访问接口（POST /api/stats/visit）即使存储失败也返回 `code: 0`，不让前端感知错误

#### 后台统计页面（管理后台）
- 单个接口失败不影响其他区域渲染（使用 `Promise.allSettled` 替代 `Promise.all`）
- 失败的区域显示错误占位 + 重试按钮，不白屏
- 网络超时阈值：10 秒，超时后显示"加载超时，请重试"

```typescript
// Promise.allSettled：即使部分请求失败，其他请求的结果仍然可用
const results = await Promise.allSettled([
  request('/api/stats/overview'),
  request('/api/stats/trend'),
  request('/api/stats/top-pages'),
  request('/api/stats/referers'),
  request('/api/stats/visits'),
]);

// results[0].status === 'fulfilled' → 成功，取 results[0].value
// results[0].status === 'rejected'  → 失败，显示错误占位
```

---

## 七、非目标（本期不做）

- 实时在线人数统计
- 访客地理位置分析（需要 IP 库）
- 用户行为路径分析
- A/B 测试支持
- 数据导出功能

---

## 八、开发流程

### 8.1 整体流程

```
PRD 评审通过 → UI 出设计稿 → 设计评审 → 前后端并行开发 → 联调 → 测试验收 → 上线
```

### 8.2 阶段拆分

| 阶段 | 负责人 | 输入 | 输出 | 预估时间 |
|------|--------|------|------|---------|
| 1. UI 设计 | UI 设计师 | 本 PRD + 设计规范（8.3） | 设计稿（Figma/即时设计） | 2-3 天 |
| 2. 设计评审 | PM + UI + 前端 | 设计稿 | 确认稿 + 标注 | 0.5 天 |
| 3. 后端开发 | 后端 | PRD 第二、三章 | 6 个可用 API | 2-3 天 |
| 4. 前端 SDK | 前端 | PRD 第六章 6.1-6.2 | 埋点 SDK | 1 天 |
| 5. 前端页面 | 前端 | 确认稿 + PRD 第四章 | 统计后台页面（不含 Canvas） | 2-3 天 |
| 6. Canvas 图表 P0 | 前端 | 确认稿 + PRD 6.3 | 基础可用的趋势图 | 2 天 |
| 7. Canvas 图表 P1 | 前端 | 确认稿 + PRD 6.3 | 核心动效 | 2 天 |
| 8. 联调测试 | 前端 + 后端 | PRD 第五章验收标准 | 验收通过 | 1-2 天 |
| 9. 上线 | 运维/开发 | 验收通过的代码 | 线上可用 | 0.5 天 |

> 阶段 3（后端）和阶段 4（SDK）可以与阶段 1（UI 设计）并行，因为它们不依赖设计稿。
> 阶段 5（前端页面）必须等设计稿确认后才能开始。
> Canvas 图表 P2、P3 为后续迭代，不阻塞上线。

### 8.3 并行关系图

```
阶段 1: UI 设计 ──────────┐
                          ├→ 阶段 5: 前端页面 → 阶段 6-7: Canvas → 阶段 8: 联调 → 阶段 9: 上线
阶段 2: 设计评审 ─────────┘         ↑
                                    │
阶段 3: 后端开发 ───────────────────┘
阶段 4: 前端 SDK ───────────────────┘
```

### 8.4 UI 设计规范（给设计师的参考）

> 以下信息供 UI 设计师参考，确保设计稿与博客现有风格统一。

#### 现有设计语言
| 属性 | 值 | 说明 |
|------|-----|------|
| 设计风格 | 玻璃拟态（Glassmorphism） | 半透明 + 模糊 + 微弱边框 |
| 主题色系统 | 10 种可切换 | 默认薄荷绿 `#10b981`，用户可切换（淡粉、紫、蓝等） |
| 字体 | Source Han Sans SC / Noto Sans SC | 中文无衬线 |
| 圆角 | 8px（小元素）/ 12px（卡片）| 统一圆润感 |
| 阴影 | `0 4px 6px -1px rgba(0,0,0,0.1)` | 轻阴影，不厚重 |
| 动效缓动 | `cubic-bezier(0.4, 0, 0.2, 1)` | 全局统一 |
| 背景 | 纯白 `#ffffff` + 主题色光晕 + 噪点纹理 | 通透、有质感 |
| 文字色 | 主标题 `#1e293b` / 正文 `#334155` / 辅助 `#64748b` | Slate 色系 |
| 选中色 | 跟随主题色 `var(--theme-primary)` | 链接、高亮、选中态 |

#### 需要设计的页面
1. `/admin/stats` 统计后台页面（PC 端 + 移动端适配）

#### 需要设计的组件
| 区域 | 组件 | 设计要点 |
|------|------|---------|
| 区域 1 | 数据卡片 × 4 | 卡片样式、图标、数字字号、时间范围切换按钮样式 |
| 区域 2 | Canvas 趋势图容器 | 毛玻璃卡片样式、7天/30天切换按钮位置、图表区域尺寸比例 |
| 区域 2 | 趋势图 tooltip | 毛玻璃浮层样式、显示内容（日期 + PV + UV） |
| 区域 3 | 热门页面表格 | 排名列样式（前三名是否高亮）、表格行间距 |
| 区域 4 | 来源饼图 | 配色方案（跟随主题色还是固定色板）、图例位置 |
| 区域 5 | 访问记录表格 | 筛选栏布局（输入框 + 日期选择器 + 搜索按钮）、分页样式 |
| 全局 | 错误占位 | 接口失败时的空状态 + 重试按钮样式 |
| 全局 | 加载态 | 页面初始加载的骨架屏或 loading 样式 |

#### 趋势图动效参考（给设计师看效果）
- 曲线发光：类似霓虹灯描边，外层柔和光晕 + 内层实线
- 数据点：小光球，有微弱呼吸脉冲
- hover 涟漪：圆环从数据点向外扩散 + 淡出
- 入场动画：曲线从左到右"画出来"
- 参考风格：可搜索 "neon line chart"、"glassmorphism dashboard" 找灵感

#### 交付物要求
- Figma/即时设计 源文件
- 标注稿（间距、字号、颜色值）
- 切图（如有自定义图标）
- PC 端 + 移动端（≤768px）两套布局

---

**PRD 版本**：v1.3  
**创建日期**：2026-04-06  
**更新日期**：2026-04-06  
**负责人**：PM