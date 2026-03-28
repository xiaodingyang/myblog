# qiankun 微前端接入完整指南

> 以 myblog 项目为例，将评论模块拆分为独立微前端子应用（React 19），通过 qiankun 集成到主应用（React 18）中。

---

## 目录

1. [整体架构](#1-整体架构)
2. [子应用搭建](#2-子应用搭建)
3. [主应用改造](#3-主应用改造)
4. [应用间通信](#4-应用间通信)
5. [开发调试](#5-开发调试)
6. [常见问题](#6-常见问题)
7. [生产部署](#7-生产部署)

---

## 1. 整体架构

```
┌─────────────────────────────────────────────┐
│              主应用 (React 18)               │
│              localhost:8001                   │
│                                              │
│  ┌─────────────────────────────────────┐     │
│  │          文章详情页                    │     │
│  │                                      │     │
│  │  ┌──────────────────────────────┐    │     │
│  │  │   MicroComment 容器组件       │    │     │
│  │  │   loadMicroApp() 加载子应用   │    │     │
│  │  │                               │    │     │
│  │  │  ┌─────────────────────────┐  │    │     │
│  │  │  │  子应用 (React 19)       │  │    │     │
│  │  │  │  localhost:8002          │  │    │     │
│  │  │  │  - CommentList          │  │    │     │
│  │  │  │  - CommentForm          │  │    │     │
│  │  │  └─────────────────────────┘  │    │     │
│  │  └──────────────────────────────┘    │     │
│  └─────────────────────────────────────┘     │
└─────────────────────────────────────────────┘
```

**技术栈对比：**

| 维度 | 主应用 | 子应用 |
|------|--------|--------|
| React | 18.3.1 | 19.2.4 |
| 框架 | Umi 4 | Umi 4 |
| UI 库 | Ant Design 5 | Ant Design 5 |
| 端口 | 8001 | 8002 |
| qiankun 角色 | 主应用（加载方） | 子应用（被加载方） |

---

## 2. 子应用搭建

### 2.1 创建项目

```bash
mkdir myblog-comment-mf && cd myblog-comment-mf
pnpm init
```

### 2.2 安装依赖

```bash
# 核心依赖（React 19）
pnpm add react@^19.0.0 react-dom@^19.0.0 umi@^4.6.34 antd@^5.29.3

# qiankun 插件
pnpm add @umijs/plugins

# 其他依赖
pnpm add @ant-design/icons dayjs

# 开发依赖
pnpm add -D typescript @types/react@^19.0.0 @types/react-dom@^19.0.0
```

### 2.3 配置 Umi（.umirc.ts）

```ts
// .umirc.ts
import { defineConfig } from 'umi';

export default defineConfig({
  title: '评论系统 - React 19 微前端',
  npmClient: 'pnpm',

  // ⭐ 关键：启用 qiankun 子应用模式
  plugins: ['@umijs/plugins/dist/qiankun'],
  qiankun: {
    slave: {},  // 声明自己是子应用
  },

  // 代理配置（子应用独立开发时使用）
  proxy: {
    '/api': {
      target: 'https://www.xiaodingyang.art',
      changeOrigin: true,
      secure: false,
    },
  },

  routes: [
    { path: '/', component: '@/pages/index' },
  ],
});
```

> **核心配置说明：**
> - `plugins: ['@umijs/plugins/dist/qiankun']`：启用 qiankun 插件
> - `qiankun.slave: {}`：声明当前应用为子应用
> - 插件会自动处理生命周期导出（bootstrap/mount/unmount）

### 2.4 配置 package.json 脚本

```json
{
  "scripts": {
    "dev": "PORT=8002 umi dev",
    "build": "umi build",
    "preview": "umi preview"
  }
}
```

### 2.5 接收主应用 Props（src/app.tsx）

```tsx
// src/app.tsx
// ⭐ qiankun 子应用的生命周期钩子
// Umi 的 qiankun 插件会自动调用这个文件

import React from 'react';
import CommentSection from '@/components/CommentSection';

// rootContainer 会包裹整个子应用
export function rootContainer(container: any, props: any) {
  // 从主应用接收的 props
  const { articleId, token, username } = props;

  return React.createElement(CommentSection, {
    articleId: articleId || 'default-id',
    token: token || (process.env.NODE_ENV === 'development' ? 'dev-token' : undefined),
    username: username || (process.env.NODE_ENV === 'development' ? '开发测试用户' : undefined),
  });
}
```

> **原理说明：**
> - Umi 的 qiankun 插件会读取 `src/app.tsx` 中的导出函数
> - `rootContainer` 是 Umi 运行时配置，用于包裹根组件
> - 主应用通过 `loadMicroApp({ props })` 传递数据

### 2.6 子应用目录结构

```
myblog-comment-mf/
├── src/
│   ├── app.tsx                  # ⭐ qiankun 生命周期 + props 接收
│   ├── components/
│   │   ├── CommentSection.tsx   # 评论区容器
│   │   ├── CommentList.tsx      # 评论列表（React 19 use Hook）
│   │   └── CommentForm.tsx      # 评论表单（React 19 useTransition）
│   ├── services/
│   │   └── comment.ts           # API 请求
│   ├── types/
│   │   └── comment.ts           # 类型定义
│   └── pages/
│       └── index.tsx            # 独立访问时的测试页面
├── .umirc.ts                    # ⭐ qiankun slave 配置
├── tsconfig.json
└── package.json
```

---

## 3. 主应用改造

### 3.1 安装 qiankun

```bash
cd myblog/frontend
pnpm add qiankun
```

### 3.2 创建微应用加载组件

```tsx
// src/components/MicroComment.tsx
import React, { useEffect, useRef } from 'react';
import { loadMicroApp } from 'qiankun';
import type { MicroApp } from 'qiankun';

interface MicroCommentProps {
  articleId: string;
  token?: string;
  username?: string;
}

export default function MicroComment({ articleId, token, username }: MicroCommentProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const microAppRef = useRef<MicroApp | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // ⭐ 手动加载微应用（适合局部嵌入场景）
    microAppRef.current = loadMicroApp({
      name: 'commentApp',                          // 微应用名称（唯一标识）
      entry: '//localhost:8002/myblog-comment-mf',  // 微应用入口地址
      container: containerRef.current,              // 挂载的 DOM 容器
      props: { articleId, token, username },         // ⭐ 传递给子应用的数据
    });

    return () => {
      // 组件卸载时，卸载微应用
      microAppRef.current?.unmount();
    };
  }, [articleId, token, username]);

  return <div ref={containerRef} />;
}
```

> **两种加载方式对比：**
>
> | 方式 | API | 适用场景 |
> |------|-----|---------|
> | `registerMicroApps` + `start` | 路由级加载 | 子应用占据整个页面 |
> | `loadMicroApp` | 组件级加载 | **子应用嵌入页面某个区域（本项目使用）** |

### 3.3 在文章详情页使用

```tsx
// src/pages/articles/detail.tsx
import MicroComment from '@/components/MicroComment';

// 在评论区位置嵌入：
<div className="mt-8">
  <MicroComment
    articleId={id}
    token={githubToken}
    username={githubUser?.username}
  />
</div>
```

### 3.4 主应用无需额外 qiankun 配置

本项目使用 `loadMicroApp` 手动加载，**不需要**在主应用的 `.umirc.ts` 中配置 qiankun。主应用的 Umi 配置保持不变。

---

## 4. 应用间通信

### 4.1 Props 传递（推荐）

```
主应用 → loadMicroApp({ props }) → 子应用 app.tsx rootContainer 接收
```

**主应用传递：**
```tsx
loadMicroApp({
  props: { articleId, token, username },
});
```

**子应用接收：**
```tsx
// src/app.tsx
export function rootContainer(container, props) {
  const { articleId, token, username } = props;
  // ...
}
```

### 4.2 全局状态（可选，复杂场景）

```ts
// 主应用
import { initGlobalState } from 'qiankun';

const actions = initGlobalState({ user: null });
actions.onGlobalStateChange((state) => {
  console.log('全局状态变化:', state);
});

// 子应用
export function useQiankunStateForSlave() {
  // Umi qiankun 插件自动注入
}
```

---

## 5. 开发调试

### 5.1 启动顺序

```bash
# 终端 1：启动子应用
cd myblog-comment-mf
PORT=8002 pnpm dev

# 终端 2：启动主应用
cd myblog/frontend
PORT=8001 pnpm dev
```

### 5.2 独立开发子应用

子应用可以独立访问 `http://localhost:8002/myblog-comment-mf`，无需启动主应用。

开发环境自动提供模拟数据（见 `src/app.tsx` 中的 `process.env.NODE_ENV === 'development'` 判断）。

### 5.3 调试技巧

- **子应用白屏**：检查浏览器控制台 `F12`，通常是依赖缺失
- **跨域问题**：子应用开发服务器默认允许跨域，无需额外配置
- **端口冲突**：Umi 会自动分配可用端口，注意日志输出的实际端口

---

## 6. 常见问题

### Q1: 子应用加载后白屏

**原因：** 依赖未安装或 MFSU 缓存问题

**解决：**
```bash
# 清除缓存
rm -rf node_modules/.cache
# 重新安装依赖
pnpm install
# 重启
PORT=8002 pnpm dev
```

### Q2: Module "@ant-design/icons" does not exist in container

**原因：** 子应用缺少 `@ant-design/icons` 依赖

**解决：**
```bash
cd myblog-comment-mf
pnpm add @ant-design/icons
```

### Q3: React 版本冲突警告

**原因：** 主应用 React 18，子应用 React 19，部分库的 peerDependencies 不匹配

**影响：** 警告不影响运行，qiankun 的沙箱机制会隔离两个 React 实例

### Q4: 子应用端口变化

**原因：** `PORT=8002` 被占用时 Umi 会自动切换端口

**解决：** 先释放端口再启动
```bash
lsof -ti:8002 | xargs kill -9
PORT=8002 pnpm dev
```

### Q5: 样式冲突

**原因：** 主应用和子应用都使用 Ant Design，CSS 可能互相影响

**解决方案：**
```ts
// 主应用加载时启用严格样式隔离
loadMicroApp({
  name: 'commentApp',
  entry: '//localhost:8002/myblog-comment-mf',
  container: containerRef.current,
  props: { articleId },
}, {
  sandbox: { strictStyleIsolation: true }, // Shadow DOM 隔离
});
```

---

## 7. 生产部署

### 7.1 子应用构建

```bash
cd myblog-comment-mf
pnpm build
```

构建产物在 `dist/` 目录。

### 7.2 Nginx 配置

```nginx
# 子应用（独立部署）
server {
    listen 80;
    server_name comment.xiaodingyang.art;

    root /var/www/myblog-comment-mf/dist;
    index index.html;

    # ⭐ 允许跨域（qiankun 需要）
    add_header Access-Control-Allow-Origin *;
    add_header Access-Control-Allow-Methods 'GET, POST, OPTIONS';
    add_header Access-Control-Allow-Headers 'DNT,X-CustomHeader,Keep-Alive,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Authorization';

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### 7.3 主应用修改入口地址

```tsx
// MicroComment.tsx - 生产环境切换地址
const entry = process.env.NODE_ENV === 'production'
  ? '//comment.xiaodingyang.art'
  : '//localhost:8002/myblog-comment-mf';

microAppRef.current = loadMicroApp({
  name: 'commentApp',
  entry,
  container: containerRef.current,
  props: { articleId, token, username },
});
```

---

## 流程总结

```
1. 创建子应用项目
   └── pnpm init + 安装依赖

2. 配置 qiankun 子应用
   ├── .umirc.ts → plugins + qiankun.slave
   └── src/app.tsx → rootContainer 接收 props

3. 编写业务组件
   └── React 19 特性：use()、useTransition、Suspense

4. 主应用安装 qiankun
   └── pnpm add qiankun

5. 主应用创建加载组件
   └── MicroComment.tsx → loadMicroApp()

6. 主应用页面集成
   └── <MicroComment articleId={id} token={token} />

7. 启动调试
   ├── 子应用: PORT=8002 pnpm dev
   └── 主应用: PORT=8001 pnpm dev
```
