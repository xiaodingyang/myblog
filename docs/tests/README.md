# 博客项目测试用例文档

> 覆盖 TASK-06 至 TASK-19 全部新功能模块

---

## 文档索引

| 文档 | 说明 | 用例数 |
|------|------|--------|
| [frontend-unit-tests.md](./frontend-unit-tests.md) | 前端组件/Hook/工具函数单元测试 | 42 |
| [frontend-integration-tests.md](./frontend-integration-tests.md) | 前端页面级集成测试 | 24 |
| [backend-api-tests.md](./backend-api-tests.md) | 后端 API 接口测试 | 28 |
| [e2e-tests.md](./e2e-tests.md) | 端到端（E2E）测试 | 18 |

---

## 功能模块与测试覆盖矩阵

| TASK | 功能名称 | 前端单元 | 前端集成 | 后端 API | E2E |
|------|---------|---------|---------|---------|-----|
| TASK-06 | 文章卡片悬停预加载 | 3 | 2 | - | 1 |
| TASK-07 | 全局搜索浮层 Ctrl+K | 4 | 2 | - | 1 |
| TASK-08 | 骨架屏精细化 | 2 | 1 | - | 1 |
| TASK-09 | 关键 CSS 内联 | 1 | 1 | - | - |
| TASK-10 | API 缓存层 | 4 | 1 | - | 1 |
| TASK-11 | 猜你喜欢推荐 | 2 | 2 | - | 1 |
| TASK-12 | 通知系统 | 3 | 2 | 8 | 2 |
| TASK-13 | 阅读成就系统 | 3 | 1 | - | 1 |
| TASK-14 | 图片灯箱 | 3 | 1 | - | 2 |
| TASK-15 | Service Worker | 2 | 1 | - | 1 |
| TASK-16 | 文章系列/专栏 | 3 | 2 | 10 | 2 |
| TASK-17 | WebP 图片优化 | 2 | 1 | 4 | 1 |
| TASK-18 | 移动端导航+滑动 | 3 | 2 | - | 2 |
| TASK-19 | React.memo 优化 | 3 | 1 | - | 1 |

---

## 优先级定义

| 级别 | 含义 | 标准 |
|------|------|------|
| P0 | 阻断级 | 核心流程不可用，必须立即修复 |
| P1 | 关键级 | 主要功能异常，影响用户体验 |
| P2 | 重要级 | 次要功能异常或有明显体验问题 |
| P3 | 一般级 | 边缘场景、视觉细节、性能微调 |

---

## 测试环境要求

### 前端

```bash
# 在 frontend/ 目录下
pnpm install
pnpm test           # Jest 单元测试
pnpm test:e2e       # Playwright E2E 测试
```

**依赖工具：**
- Jest 29 + React Testing Library（单元测试）
- Playwright（E2E 测试）
- React DevTools Profiler（渲染性能验证）

### 后端

```bash
# 在 backend/ 目录下
pnpm install
pnpm test           # Jest + Supertest
```

**依赖工具：**
- Jest 29
- Supertest（HTTP 接口测试）
- mongodb-memory-server（内存 MongoDB）

### E2E

```bash
cd frontend
pnpm exec playwright install
pnpm exec playwright test
```

**测试浏览器：**
- Chrome（最新版）
- Firefox（最新版）
- Mobile Chrome（Pixel 5 模拟）
- Mobile Safari（iPhone 13 模拟）

---

## 测试 ID 编号规则

| 前缀 | 类别 |
|------|------|
| FU | Frontend Unit（前端单元测试） |
| FI | Frontend Integration（前端集成测试） |
| BA | Backend API（后端接口测试） |
| EE | End-to-End（端到端测试） |

编号格式：`{前缀}-{序号}`，如 `FU-001`、`BA-015`。

---

## 执行顺序建议

1. **第一阶段**：后端 API 测试（BA）→ 确保接口可用
2. **第二阶段**：前端单元测试（FU）→ 验证组件和工具函数
3. **第三阶段**：前端集成测试（FI）→ 验证页面功能整合
4. **第四阶段**：E2E 测试（EE）→ 验证完整用户流程

---

## 相关文件路径速查

| 用途 | 路径 |
|------|------|
| 前端配置 | `frontend/.umirc.ts` |
| 前台布局 | `frontend/src/layouts/FrontLayout.tsx` |
| 后台布局 | `frontend/src/layouts/AdminLayout.tsx` |
| 首页 | `frontend/src/pages/home/index.tsx` |
| 文章详情页 | `frontend/src/pages/articles/detail.tsx` |
| 文章列表页 | `frontend/src/pages/articles/index.tsx` |
| 文章卡片 | `frontend/src/components/ArticleCard/index.tsx` |
| 工具函数 | `frontend/src/utils/` |
| 后端入口 | `backend/src/index.js` |
| 后端路由 | `backend/src/routes/index.js` |
| 后端模型 | `backend/src/models/` |
| 后端控制器 | `backend/src/controllers/` |
