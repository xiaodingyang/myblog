# PRD - 深色模式 🌙

## 1. 概述

为博客添加深色模式切换功能，保护用户眼睛，同时提升夜间阅读体验。

## 2. 实现方式

### 技术方案
- 使用 Ant Design 5 内置 `theme.darkAlgorithm` 实现组件级深色主题
- 手动覆盖 body 背景色 + 关键卡片/列表背景
- 深色模式状态存储在 localStorage

### 触发入口
- 主题设置抽屉（悬浮按钮 right-4 bottom-20）
- 新增「深色模式」开关

### 实现内容
1. `app.tsx` — 读取 localStorage，应用 `theme.darkAlgorithm` 到 ConfigProvider
2. `global.css` — 添加 `body.dark-mode` 样式覆盖
3. `ParticleThemeSelector.tsx` — 添加深色模式 Switch 组件

## 3. 深色模式效果

| 元素 | 浅色 | 深色 |
|------|------|------|
| 页面背景 | #fafafa 渐变 | #1a1a2e 渐变 |
| 卡片 | #ffffff | #1f1f1f |
| 列表 | 透明 | 透明 |
| Ant Design 组件 | 自动适配 | 自动适配 |

## 4. 已知限制

- 切换深色模式需要刷新页面（因为 ConfigProvider 在初始化时读取）
- 自定义 CSS（如部分卡片样式）可能需要手动适配

## 5. 状态

- ✅ 后端支持
- ✅ 前端实现
- ✅ 代码已提交
