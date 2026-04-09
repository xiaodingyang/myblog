# E2E 测试指南

## 快速开始

```bash
cd myblog/frontend

# 安装依赖
pnpm install

# 安装 Playwright 浏览器
pnpm exec playwright install

# 运行测试（本地模式）
pnpm e2e

# 运行测试（线上模式）
TEST_TARGET=production pnpm e2e

# 带 UI 调试
pnpm exec playwright test --ui

# 查看报告
pnpm exec playwright show-report
```

## 环境配置

### 配置文件

- `tests/.env.example` - 配置模板
- `tests/.env.local` - 本地配置（已加入 .gitignore）

### 关键配置项

| 配置项 | 说明 | 默认值 |
|--------|------|--------|
| `TEST_TARGET` | 测试目标：`local` 或 `production` | `production` |
| `LOCAL_BASE_URL` | 本地前端地址 | `http://127.0.0.1:8001` |
| `LOCAL_API_URL` | 本地后端地址 | `http://127.0.0.1:3000` |
| `PRODUCTION_BASE_URL` | 线上地址 | `https://www.xiaodingyang.art` |
| `USE_MOCK_API` | 是否使用 Mock API | `false` |
| `TEST_ADMIN_USERNAME` | 测试账号用户名 | `ruofeng` |
| `TEST_ADMIN_PASSWORD` | 测试账号密码 | `ruofeng123` |

### 切换环境

**本地测试（使用 Mock API）：**
```bash
# tests/.env.local
TEST_TARGET=local
USE_MOCK_API=true
```

**线上测试：**
```bash
# tests/.env.local
TEST_TARGET=production
USE_MOCK_API=false
```

## 测试结构

```
tests/
├── config.ts           # 环境配置
├── global-setup.ts     # 全局初始化
├── .env.example        # 配置模板
├── .env.local          # 本地配置
└── e2e/
    ├── _fixtures.ts    # 公共 fixtures + Mock API
    ├── pages.spec.ts   # 页面功能测试
    ├── admin.spec.ts   # 后台管理测试
    ├── visual.spec.ts  # 可视化回归测试
    ├── validation.spec.ts # 表单验证测试
    └── github-mock.spec.ts # GitHub 登录测试
```

## Mock API

### 启用 Mock API

```bash
# tests/.env.local
USE_MOCK_API=true
```

### Mock 数据

Mock 数据定义在 `tests/e2e/_fixtures.ts` 中：

- `MOCK_ARTICLES` - 文章数据
- `MOCK_CATEGORIES` - 分类数据
- `MOCK_TAGS` - 标签数据
- `MOCK_USER` - 用户数据

### 自定义 Mock 数据

```typescript
import { mockData } from './_fixtures';

// 使用 mock 数据
console.log(mockData.articles);
```

## 可视化回归测试

### 更新截图基线

```bash
# 更新所有截图
pnpm exec playwright test --update-snapshots

# 更新特定测试
pnpm exec playwright test visual.spec.ts --update-snapshots
```

### 截图配置

- `maxDiffPixels`: 100000
- `maxDiffPixelRatio`: 0.10
- 动态内容自动 mask（统计数据、相对时间等）

## 调试技巧

### 查看 Trace

```bash
# 运行并保留 trace
pnpm exec playwright test --trace on

# 查看 trace
pnpm exec playwright show-trace trace.zip
```

### 调试模式

```bash
# UI 模式
pnpm exec playwright test --ui

# Debug 模式
pnpm exec playwright test --debug

# headed 模式（显示浏览器）
pnpm exec playwright test --headed
```

### 查看错误日志

测试失败时，HTML 报告会包含：
- 页面错误日志
- 网络错误日志
- 失败截图

## CI/CD

GitHub Actions 自动运行：
- PR 创建/更新时
- main 分支 push 时

查看报告：
1. 进入 GitHub Actions
2. 选择对应的 workflow run
3. 下载 `playwright-report` artifact

## 最佳实践

1. **本地开发时使用 Mock API**：避免依赖真实数据
2. **提交前运行线上测试**：确保功能正常
3. **定期更新截图基线**：UI 变更后及时更新
4. **使用 `--trace on-first-failure`**：失败时保留调试信息
