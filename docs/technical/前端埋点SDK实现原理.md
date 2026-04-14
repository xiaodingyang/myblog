# 前端埋点 SDK 实现原理

## 一、什么是埋点 SDK？

**埋点 SDK（Software Development Kit）** 是一段封装好的前端代码，用于**自动采集用户行为数据**并上报给后端，帮助产品分析用户行为、优化体验。

### 核心功能

- **PV（Page View）统计** — 记录页面访问次数
- **UV（Unique Visitor）统计** — 识别独立访客
- **用户行为追踪** — 点击、滚动、停留时长等
- **性能监控** — 页面加载速度、资源耗时
- **错误监控** — JS 报错、资源加载失败

### 常见的埋点 SDK

| SDK | 用途 |
|-----|------|
| Google Analytics | 网站流量分析 |
| 百度统计 | 国内网站统计 |
| Sentry | 前端错误监控 |
| 神策数据 | 用户行为分析 |

---

## 二、PV 自动记录的实现原理

### 2.1 什么是 PV？

**PV = Page View**，每次用户访问一个页面，就算一次 PV。

例如用户浏览轨迹：`首页 → 文章列表 → 文章详情 → 首页`，这就是 **4 次 PV**。

### 2.2 传统网站 vs SPA 单页应用

#### 传统多页应用（MPA）

每次跳转都会**重新加载整个页面**：

```
用户点击链接 → 浏览器请求新 HTML → 页面重新加载 → 服务器记录 PV
```

服务器天然能记录每次页面请求，无需前端额外处理。

#### 单页应用（SPA）

页面**不会重新加载**，只是 JS 动态替换内容：

```
用户点击链接 → JS 拦截 → 更新 URL → 替换页面组件 → 页面没有刷新
```

**问题：** 服务器根本不知道用户换了页面，因为没有发起新的 HTML 请求。

**解决方案：** 前端监听 URL 变化，主动上报 PV。

### 2.3 监听 URL 变化的三种情况

SPA 中 URL 变化有 **3 种情况**，需要全部监听：

#### 情况 1：用户点击浏览器的「前进/后退」按钮

浏览器会触发 `popstate` 事件：

```typescript
window.addEventListener('popstate', () => {
  // URL 变了，说明用户换页面了，记录 PV
  reportPageView();
});
```

#### 情况 2：代码主动跳转（点击导航链接）

Umi/React Router 内部使用 `history.pushState()` 来改变 URL，但这个方法**默认不会触发任何事件**。

**解决方案：劫持 `pushState` 方法**

```typescript
const originalPushState = history.pushState;

history.pushState = function (...args) {
  originalPushState.apply(this, args);  // 先执行原来的逻辑
  reportPageView();                      // 再记录 PV
};
```

#### 情况 3：代码调用 `replaceState`（替换当前历史记录）

同理劫持 `replaceState`：

```typescript
const originalReplaceState = history.replaceState;

history.replaceState = function (...args) {
  originalReplaceState.apply(this, args);
  reportPageView();
};
```

### 2.4 上报函数实现

```typescript
function reportPageView() {
  // 收集当前页面信息
  const data = {
    path: location.pathname,       // 当前路径，如 /articles/123
    title: document.title,         // 页面标题
    referrer: document.referrer,   // 从哪来的（上一个页面的 URL）
    sessionId: getSessionId(),     // 标识这个访客是谁
    timestamp: Date.now(),         // 什么时候访问的
  };

  // 发给后端
  fetch('/api/stats/visit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}
```

### 2.5 完整流程示意

```
用户打开博客首页
  │
  ├─→ SDK init() 被调用
  │     ├─→ 劫持 pushState / replaceState
  │     ├─→ 监听 popstate
  │     └─→ 立即上报一次首页 PV ✅
  │
  ├─→ 用户点击「文章列表」
  │     ├─→ Umi Router 调用 history.pushState(...)
  │     ├─→ 被劫持的 pushState 执行
  │     └─→ 上报 /articles 的 PV ✅
  │
  ├─→ 用户点击某篇文章
  │     ├─→ pushState 再次被调用
  │     └─→ 上报 /articles/123 的 PV ✅
  │
  └─→ 用户点击浏览器「后退」
        ├─→ 触发 popstate 事件
        └─→ 上报 /articles 的 PV ✅
```

---

## 三、SessionId 管理

### 3.1 什么是 SessionId？

**SessionId** 用于标识一个**唯一访客**，区分不同用户的访问。

- 同一个用户在一段时间内的多次访问，使用同一个 SessionId
- 不同用户有不同的 SessionId

### 3.2 生成策略

```typescript
function getOrCreateSessionId(): string {
  const storageKey = 'visitor_session_id';
  let sessionId = localStorage.getItem(storageKey);

  if (!sessionId) {
    // 生成新的 sessionId：时间戳 + 随机字符串
    sessionId = `${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    localStorage.setItem(storageKey, sessionId);
  }

  return sessionId;
}
```

### 3.3 SessionId vs UserId

| 维度 | SessionId | UserId |
|------|-----------|--------|
| **生成时机** | 用户首次访问网站 | 用户注册/登录后 |
| **存储位置** | localStorage | 后端数据库 + Cookie/Token |
| **作用** | 区分不同访客（匿名） | 区分不同用户（实名） |
| **持久性** | 清除浏览器数据后失效 | 永久有效 |

**最佳实践：** 同时使用两者

- 未登录用户：只有 SessionId（匿名统计）
- 已登录用户：SessionId + UserId（关联用户身份）

---

## 四、SDK 架构设计

### 4.1 核心模块

```
Analytics SDK
├── 初始化模块 (init)
│   ├── 配置管理
│   ├── SessionId 生成
│   └── 事件监听注册
│
├── 数据采集模块
│   ├── PV 采集
│   ├── 点击事件采集
│   ├── 性能数据采集
│   └── 错误监控
│
├── 数据上报模块
│   ├── 批量队列
│   ├── 失败重试
│   └── 离线缓存
│
└── 工具模块
    ├── 防抖/节流
    ├── 数据加密
    └── 日志输出
```

### 4.2 代码结构示例

```typescript
class Analytics {
  private sessionId: string;
  private config: AnalyticsConfig;
  private reportQueue: Event[] = [];

  constructor(config: AnalyticsConfig) {
    this.config = config;
    this.sessionId = this.getOrCreateSessionId();
  }

  // 初始化
  public init(): void {
    this.setupRouteListener();
    this.setupClickListener();
    this.setupPerformanceMonitor();
    this.setupErrorMonitor();
    this.trackPageView(); // 首次访问
  }

  // 监听路由变化
  private setupRouteListener(): void {
    window.addEventListener('popstate', () => this.trackPageView());
    
    const originalPushState = history.pushState;
    history.pushState = (...args) => {
      originalPushState.apply(history, args);
      this.trackPageView();
    };
  }

  // 记录 PV
  public trackPageView(): void {
    const data = {
      type: 'pageview',
      path: location.pathname,
      title: document.title,
      sessionId: this.sessionId,
      timestamp: Date.now(),
    };
    this.report(data);
  }

  // 上报数据
  private report(data: Event): void {
    this.reportQueue.push(data);
    
    // 批量上报（5条/批 或 10秒/批）
    if (this.reportQueue.length >= 5) {
      this.flush();
    }
  }

  // 批量发送
  private flush(): void {
    fetch(this.config.endpoint, {
      method: 'POST',
      body: JSON.stringify(this.reportQueue),
    });
    this.reportQueue = [];
  }
}
```

---

## 五、性能优化策略

### 5.1 体积优化

- **Tree Shaking** — 只打包用到的功能
- **代码压缩** — UglifyJS / Terser
- **目标体积** — < 5KB gzipped（博客场景）

### 5.2 异步加载

```html
<!-- 不阻塞首屏渲染 -->
<script async src="/analytics.js"></script>
```

### 5.3 批量上报

减少请求次数，降低服务器压力：

```typescript
class ReportQueue {
  private queue: Event[] = [];
  private maxSize = 5;           // 5条/批
  private flushInterval = 10000; // 10秒/批

  constructor() {
    setInterval(() => this.flush(), this.flushInterval);
  }

  push(event: Event) {
    this.queue.push(event);
    if (this.queue.length >= this.maxSize) {
      this.flush();
    }
  }

  flush() {
    if (this.queue.length === 0) return;
    
    fetch('/api/stats/batch', {
      method: 'POST',
      body: JSON.stringify(this.queue),
    });
    this.queue = [];
  }
}
```

### 5.4 离线缓存

网络失败时存入 localStorage，下次重试：

```typescript
private async report(data: Event): Promise<void> {
  try {
    await fetch('/api/stats', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  } catch (error) {
    // 存入离线队列
    const offlineQueue = JSON.parse(localStorage.getItem('offline_queue') || '[]');
    offlineQueue.push(data);
    localStorage.setItem('offline_queue', JSON.stringify(offlineQueue));
  }
}

// 网络恢复后重试
window.addEventListener('online', () => {
  this.retryOfflineQueue();
});
```

### 5.5 采样率

高流量场景下，只采集部分用户数据：

```typescript
class Analytics {
  private sampleRate: number = 0.1; // 10% 采样

  public trackPageView(): void {
    if (Math.random() > this.sampleRate) {
      return; // 不采集
    }
    // 正常采集逻辑
  }
}
```

---

## 六、扩展功能

### 6.1 停留时长统计

```typescript
class Analytics {
  private enterTime: number = 0;

  public trackPageView(): void {
    // 记录进入时间
    this.enterTime = Date.now();
  }

  private trackPageLeave(): void {
    const duration = Date.now() - this.enterTime;
    this.report({
      type: 'duration',
      path: location.pathname,
      duration,
    });
  }
}

// 监听页面离开
window.addEventListener('beforeunload', () => {
  analytics.trackPageLeave();
});
```

### 6.2 阅读深度（滚动百分比）

```typescript
let maxScrollDepth = 0;

window.addEventListener('scroll', () => {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const scrollPercent = Math.round((scrollTop / docHeight) * 100);

  if (scrollPercent > maxScrollDepth) {
    maxScrollDepth = scrollPercent;
  }
});

// 页面离开时上报
window.addEventListener('beforeunload', () => {
  analytics.report({
    type: 'scroll_depth',
    depth: maxScrollDepth,
  });
});
```

### 6.3 点击事件追踪

```typescript
document.addEventListener('click', (e) => {
  const target = e.target as HTMLElement;
  
  // 只追踪带 data-track 属性的元素
  const trackId = target.getAttribute('data-track');
  if (trackId) {
    analytics.track('click', {
      element: trackId,
      text: target.innerText,
    });
  }
});
```

使用示例：

```html
<button data-track="share-button">分享文章</button>
<a data-track="external-link" href="https://example.com">外部链接</a>
```

### 6.4 性能监控（Web Vitals）

```typescript
// 监听 FCP（First Contentful Paint）
new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    if (entry.name === 'first-contentful-paint') {
      analytics.report({
        type: 'performance',
        metric: 'FCP',
        value: entry.startTime,
      });
    }
  }
}).observe({ entryTypes: ['paint'] });

// 监听 LCP（Largest Contentful Paint）
new PerformanceObserver((list) => {
  const entries = list.getEntries();
  const lastEntry = entries[entries.length - 1];
  analytics.report({
    type: 'performance',
    metric: 'LCP',
    value: lastEntry.startTime,
  });
}).observe({ entryTypes: ['largest-contentful-paint'] });
```

### 6.5 错误监控

```typescript
// 监听 JS 错误
window.addEventListener('error', (event) => {
  analytics.report({
    type: 'error',
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    stack: event.error?.stack,
  });
});

// 监听 Promise 未捕获错误
window.addEventListener('unhandledrejection', (event) => {
  analytics.report({
    type: 'promise_error',
    reason: event.reason,
  });
});

// 监听资源加载失败
window.addEventListener('error', (event) => {
  const target = event.target as HTMLElement;
  if (target.tagName === 'IMG' || target.tagName === 'SCRIPT') {
    analytics.report({
      type: 'resource_error',
      url: (target as any).src,
    });
  }
}, true); // 捕获阶段
```

---

## 七、后端接口设计

### 7.1 单条上报接口

```
POST /api/stats/visit

Request Body:
{
  "path": "/articles/123",
  "title": "我的第一篇文章",
  "referrer": "https://google.com",
  "sessionId": "1234567890_abc123",
  "timestamp": 1678901234567
}

Response:
{
  "success": true
}
```

### 7.2 批量上报接口

```
POST /api/stats/batch

Request Body:
[
  {
    "type": "pageview",
    "path": "/articles/123",
    "sessionId": "xxx",
    "timestamp": 1678901234567
  },
  {
    "type": "click",
    "element": "share-button",
    "sessionId": "xxx",
    "timestamp": 1678901235000
  }
]

Response:
{
  "success": true,
  "received": 2
}
```

### 7.3 MongoDB Schema 设计

```javascript
const VisitSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, index: true },
  userId: { type: String, index: true }, // 登录用户 ID（可选）
  path: { type: String, required: true },
  title: String,
  referrer: String,
  userAgent: String,
  ip: String,
  timestamp: { type: Date, default: Date.now, index: true },
  
  // 扩展字段
  duration: Number,        // 停留时长（秒）
  scrollDepth: Number,     // 滚动深度（百分比）
  
  // 性能数据
  performance: {
    fcp: Number,
    lcp: Number,
    fid: Number,
  },
});

// 复合索引：按日期查询 PV
VisitSchema.index({ timestamp: -1, path: 1 });
```

---

## 八、使用示例

### 8.1 初始化

```typescript
// app.tsx
import analytics from '@/utils/analytics';

export function rootContainer(container: any) {
  // 初始化埋点 SDK
  analytics.init({
    endpoint: '/api/stats',
    batchSize: 5,
    flushInterval: 10000,
    sampleRate: 1.0, // 100% 采样
  });

  return container;
}
```

### 8.2 手动埋点

```typescript
// 文章详情页
import analytics from '@/utils/analytics';

export default function ArticleDetail() {
  const handleShare = () => {
    analytics.track('share_article', {
      article_id: articleId,
      share_platform: 'wechat',
    });
  };

  return (
    <button onClick={handleShare}>分享</button>
  );
}
```

---

## 九、最佳实践

### 9.1 隐私保护

- **不采集敏感信息** — 密码、身份证号、手机号等
- **IP 脱敏** — 只保留前三段（如 `192.168.1.*`）
- **遵守 GDPR** — 提供用户选择退出的选项

### 9.2 性能影响

- **异步加载** — 不阻塞首屏渲染
- **批量上报** — 减少请求次数
- **采样率** — 高流量场景下降低采样率

### 9.3 数据准确性

- **防重复提交** — 同一页面 5 分钟内只上报一次
- **过滤爬虫** — 根据 User-Agent 过滤搜索引擎爬虫
- **去除测试数据** — 开发环境不上报

### 9.4 可维护性

- **版本管理** — SDK 版本号，方便追踪问题
- **日志输出** — 开发环境输出详细日志
- **错误上报** — SDK 自身错误也要上报

---

## 十、总结

### 核心原理

1. **监听 URL 变化** — `popstate` + 劫持 `pushState/replaceState`
2. **采集页面信息** — path、title、referrer、sessionId
3. **批量上报** — 减少请求次数，提升性能
4. **离线缓存** — 网络失败时存入 localStorage

### 技术要点

- **SessionId 管理** — localStorage 持久化
- **性能优化** — 异步加载、批量上报、采样率
- **扩展功能** — 停留时长、阅读深度、点击追踪、性能监控、错误监控

### 后续优化方向

- [ ] 实现批量上报队列
- [ ] 添加离线缓存机制
- [ ] 支持自定义事件追踪
- [ ] 集成 Web Vitals 性能监控
- [ ] 添加错误监控能力
- [ ] 后台数据可视化（访问趋势图、热门文章排行）

---

**参考资料：**

- [Google Analytics Measurement Protocol](https://developers.google.com/analytics/devguides/collection/protocol/v1)
- [Web Vitals](https://web.dev/vitals/)
- [MDN - History API](https://developer.mozilla.org/en-US/docs/Web/API/History_API)
