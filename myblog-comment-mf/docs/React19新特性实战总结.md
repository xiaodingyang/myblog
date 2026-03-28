# React 19 新特性实战总结

> 基于 `myblog-comment-mf`（评论系统微前端子应用）的实战总结  
> 技术栈：Umi 4 + React 19 + Ant Design 5 + qiankun

---

## 1. 项目背景与目标

将 `myblog` 主应用（React 18）中的评论模块拆分为独立微前端子应用（React 19），通过 qiankun 集成，目标是在不影响主站稳定性的前提下验证 React 19 新特性在真实业务中的收益。

```text
主应用 (React 18, localhost:8001)
  └── 文章详情页
        └── MicroComment 容器
              └── 子应用 (React 19, localhost:8002)
                    ├── CommentSection  ← useOptimistic
                    ├── CommentList     ← use() + Suspense
                    └── CommentForm     ← useTransition / startTransition
```

---

## 2. use() Hook：渲染期读取异步数据与 Context

### 2.1 use(Promise)：替代传统 loading 三件套

`use()` 是 React 19 的核心能力之一，支持在渲染期间直接读取 Promise。

```tsx
import { use, Suspense } from 'react';

function CommentList({ commentsPromise }: { commentsPromise: Promise<Comment[]> }) {
  const comments = use(commentsPromise);
  return <List dataSource={comments} renderItem={(c) => <CommentItem comment={c} />} />;
}

<Suspense fallback={<Spin tip="加载评论中..." />}>
  <CommentList commentsPromise={commentsPromise} />
</Suspense>
```

工作机制：

1. `use(commentsPromise)` 读取 Promise。
2. Promise `pending` 时，React 抛出 Promise 给最近的 `Suspense`。
3. `Suspense` 渲染 `fallback`。
4. Promise `resolved` 后重渲染，`use()` 返回数据。

### 2.2 use(Context)：更灵活的 Context 读取方式

```tsx
import { createContext, use } from 'react';

interface UserContextType {
  username: string;
  isVip: boolean;
}

const UserContext = createContext<UserContextType>({ username: '游客', isVip: false });

function UserProfile() {
  const user = use(UserContext);
  return (
    <Space>
      <Text>用户: {user.username}</Text>
      {user.isVip && <Text mark>VIP</Text>}
    </Space>
  );
}
```

说明：这里使用的是项目演示组件中的真实写法，`use(Context)` 与 `useContext` 在语义上等价，但在调用位置上更灵活。

对比：

| 对比项 | `useContext` | `use(Context)` |
|---|---|---|
| 调用位置 | 需在组件顶层 | 可在条件/循环中使用 |
| Provider 依赖 | 必须在 Provider 内 | 同样必须在 Provider 内 |
| 灵活性 | 更偏静态 | 更灵活 |

### 2.3 实战注意事项

- Promise 必须稳定（推荐 `useMemo` 缓存），否则可能重复请求或反复触发 Suspense。
- 必须配合 `Suspense`（以及建议配合 ErrorBoundary）使用。
- `use()` 适合渲染期数据；订阅、埋点、DOM 交互等副作用仍应使用 `useEffect`。

---

## 3. useOptimistic：评论乐观更新

### 3.1 解决的问题

用户提交评论后，如果等待接口返回再刷新列表，体感延迟明显。`useOptimistic` 允许先展示“预期成功结果”，再由真实数据收敛状态。

### 3.2 核心 API

```tsx
const [optimisticState, addOptimistic] = useOptimistic(actualState, updateFn);
```

- `optimisticState`：用于渲染的状态（可能包含乐观数据）。
- `addOptimistic(value)`：立即推入乐观更新。
- 当 `actualState` 更新后，乐观层自动与真实状态对齐。

### 3.3 项目代码（CommentSection）

```tsx
const [comments, setComments] = useState<Comment[]>([]);

const [optimisticComments, addOptimistic] = useOptimistic(
  comments,
  (currentComments: Comment[], newComment: Comment) => [newComment, ...currentComments]
);

const handleSubmit = useCallback(async (content: string) => {
  const optimisticComment: Comment = {
    _id: 'temp-' + Date.now(),
    content,
    author: { username: username || '我' },
    createdAt: new Date().toISOString(),
    pending: true,
  };

  addOptimistic(optimisticComment);

  const realComment = await postComment(articleId, content, token!);
  setComments((prev) => [realComment, ...prev]);
}, [articleId, token, username, addOptimistic]);
```

### 3.4 关键点

- 渲染应优先使用 `optimisticComments`，而不是 `comments`。
- `pending: true` 用于 UI 区分“发送中”态（如半透明、状态提示）。
- 失败时需要在提交逻辑中做好异常处理和提示，保证交互闭环。

演示组件中的简化示例（任务列表场景）：

```tsx
interface TodoItem {
  id: string;
  text: string;
  done: boolean;
  pending?: boolean;
}

const [optimisticTodos, addOptimisticTodo] = useOptimistic(
  todos,
  (current: TodoItem[], newTodo: TodoItem) => [...current, newTodo]
);

const addTodo = async (text: string) => {
  const tempTodo: TodoItem = { id: `temp-${Date.now()}`, text, done: false, pending: true };
  addOptimisticTodo(tempTodo);

  await new Promise((r) => setTimeout(r, 1000));
  setTodos((prev) => [...prev, { ...tempTodo, pending: false }]);
};
```

---

## 4. useTransition 与 startTransition：非阻塞更新

### 4.1 useTransition 的职责

`useTransition` 用于把某类更新标记为非紧急更新，让输入、点击等高优先级交互先响应，避免界面卡顿。

```tsx
const [isPending, startTransition] = useTransition();

startTransition(() => {
  setFilteredList(next);
});
```

搜索场景的演示代码（来自 `React19Showcase`）：

```tsx
const [isPending, startTransition] = useTransition();
const [query, setQuery] = useState('');
const [results, setResults] = useState<string[]>([]);

const handleSearch = (value: string) => {
  setQuery(value);

  startTransition(async () => {
    await new Promise((r) => setTimeout(r, 500));
    setResults(value ? [`${value} 的结果 1`, `${value} 的结果 2`, `${value} 的结果 3`] : []);
  });
};
```

适用场景：搜索筛选、大列表过滤、Tab/视图切换等。

### 4.2 startTransition 在 React 19 的增强（支持 async）

`startTransition` 的核心用途是：把一批状态更新标记为“低优先级过渡更新（transition）”。

React 19 中可直接传 `async` 函数，写法更自然：

```tsx
startTransition(async () => {
  const data = await fetchData();
  setData(data);
});
```

在评论表单中的实践：

```tsx
const [isPending, startTransition] = useTransition();

const handleSubmit = async (values: { content: string }) => {
  startTransition(async () => {
    try {
      await onSubmit(values.content);
      message.success('评论发表成功');
      form.resetFields();
    } catch (error: any) {
      message.error(error.message || '评论发表失败');
    }
  });
};
```

`isPending` 可直接驱动按钮 loading 和表单禁用状态。

---

## 5. Suspense + use() + useOptimistic 协作关系

本项目中三者协作的数据流如下：

```text
首次加载：
  commentsPromise(pending) → Suspense fallback
  commentsPromise(resolved) → use() 拿到数据
                           → 同步到 comments（真实状态）
                           → useOptimistic 基于 comments 生成 optimisticComments

提交评论：
  addOptimistic(假评论) → 列表立即显示（发送中）
  await postComment()   → setComments(真评论)
                        → optimistic 层自动收敛为真实状态
```

职责拆分：

| Hook / 机制 | 职责 | 组件 |
|---|---|---|
| `useOptimistic` | 立即反馈 + 乐观状态管理 | `CommentSection` |
| `useTransition` | 提交过程的非阻塞过渡与 pending 状态 | `CommentForm` |
| `use()` + `Suspense` | 声明式异步读取与 loading 展示 | `CommentList` |

---

## 6. 其他新特性与补充

### 6.1 useRef 新写法

React 19 下可更自然地使用初始值推断：

```tsx
const timerRef = useRef(0);
const dataRef = useRef({ count: 0 });
```

演示组件中的计数器示例：

```tsx
function CounterWithRef() {
  const count = useRef(0);
  const [, forceUpdate] = useState({});

  const increment = () => {
    count.current += 1;
    forceUpdate({});
  };

  return (
    <Space direction="vertical">
      <Text>计数: {count.current}</Text>
      <Button onClick={increment}>增加</Button>
    </Space>
  );
}
```

减少了 `null` 联合类型与额外泛型标注负担。

### 6.2 资源预加载（Web API）

在页面层可配合以下能力优化体验：

- `preload`：关键图片/字体等资源预加载
- `dns-prefetch`：DNS 预解析
- `preconnect`：提前建立连接

演示组件中的调用示例：

```tsx
const preloadImage = () => {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'image';
  link.href = 'https://via.placeholder.com/100';
  document.head.appendChild(link);
};

const preconnect = () => {
  const link = document.createElement('link');
  link.rel = 'preconnect';
  link.href = 'https://via.placeholder.com';
  link.crossOrigin = 'anonymous';
  document.head.appendChild(link);
};
```

---

## 7. 踩坑与修复记录

### 7.1 乐观评论“闪现后消失”

现象：评论出现后很快消失。  
原因：提交接口失败（如鉴权 401），真实状态未更新。  
处理：补充错误处理与提示，确保接口成功后及时 `setComments`。

### 7.2 在组件渲染中直接创建 Promise

错误示例（会导致重复创建 Promise）：

```tsx
const comments = use(fetchComments(articleId));
```

正确方式：在父组件使用 `useMemo` 创建稳定 Promise，再通过 props 传入。

### 7.3 qiankun 插件未注册

Umi 4 子应用需要显式声明：

```ts
plugins: ['@umijs/plugins/dist/qiankun']
```

否则会出现 `Invalid config keys: qiankun`。

### 7.4 子应用缺少 `@ant-design/icons`

现象：白屏并提示模块缺失。  
处理：安装 `@ant-design/icons`，并确保与 antd 版本兼容。

---

## 8. 项目落地映射

### 8.1 文件结构

```text
myblog-comment-mf/
├── src/
│   ├── components/
│   │   ├── CommentSection.tsx    # useOptimistic + Suspense 协同
│   │   ├── CommentForm.tsx       # useTransition / startTransition
│   │   ├── CommentList.tsx       # use() 读取 Promise
│   │   └── contexts/
│   │       └── ThemeContext.tsx  # use() 读取 Context
│   ├── pages/
│   │   └── index.tsx
│   └── services/
│       └── comment.ts
```

### 8.2 特性使用清单

| 特性 | 文件 | 用途 |
|---|---|---|
| `use(Promise)` | `CommentList.tsx` | 读取评论列表 |
| `useOptimistic` | `CommentSection.tsx` | 评论提交乐观更新 |
| `useTransition` / `startTransition` | `CommentForm.tsx` | 非阻塞提交与 pending 态 |
| `Suspense` | `CommentSection.tsx` / `CommentList.tsx` | 声明式 loading |
| `use(Context)` | `ThemeContext.tsx` | 主题读取 |
| `useRef` | 文档示例（已并入本文） | 引用与计数演示 |

---

## 9. 总结

在该微前端评论系统中，React 19 的主要收益是：

1. **数据读取更声明式**：`use() + Suspense` 降低样板代码。
2. **交互反馈更即时**：`useOptimistic` 显著改善提交体验。
3. **并发体验更平滑**：`useTransition/startTransition` 减少阻塞感。

本次实践表明，React 19 新特性在“列表加载 + 表单提交 + 状态回写”这类典型业务闭环中具备明确的可落地价值。

---

## 参考资料

- [React 官方博客](https://react.dev/blog)
- [React `use` 文档](https://react.dev/reference/react/use)
- [React `useOptimistic` 文档](https://react.dev/reference/react/useOptimistic)
- [React `useTransition` 文档](https://react.dev/reference/react/useTransition)

---

*最后更新：2026-03-28*