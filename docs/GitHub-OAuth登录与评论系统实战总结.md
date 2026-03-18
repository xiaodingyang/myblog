# GitHub OAuth 登录与评论系统实战总结

## 一、需求背景

个人博客希望实现访客互动功能，具体需求：

1. 访客进入博客后弹出登录提示，可选择使用 GitHub 账号授权登录
2. 登录后可以：评论文章、在留言板留言、复制文本、分享链接
3. 未登录时触发以上操作会弹出登录弹窗
4. 后台管理新增用户管理模块，管理 GitHub 授权登录的用户

> 最初计划使用微信授权登录，但微信开放平台需要企业资质认证（营业执照 + 300 元认证费），个人开发者无法申请。因此改用 GitHub OAuth，免费且注册即用。

## 二、整体架构

```
访客浏览器                    后端服务器                    GitHub
    │                           │                           │
    ├── 点击"GitHub 登录" ──────▶│                           │
    │                           ├── 生成 state ──────────────▶│
    │◀── 302 重定向 ────────────┤   跳转授权页                │
    │                           │                           │
    ├── 用户在 GitHub 授权 ─────────────────────────────────▶│
    │                           │                           │
    │   GitHub 回调 ────────────▶├── code 换 access_token ──▶│
    │                           │◀── 返回 token ────────────┤
    │                           │                           │
    │                           ├── token 获取用户信息 ─────▶│
    │                           │◀── 返回 login,avatar 等 ──┤
    │                           │                           │
    │                           ├── 创建/更新 GithubUser     │
    │                           ├── 签发 JWT                 │
    │◀── 重定向回前端 + JWT ────┤                           │
    │                           │                           │
    ├── 存储 JWT + 用户信息     │                           │
    ├── 携带 JWT 发表评论 ─────▶│                           │
    │◀── 返回成功 ──────────────┤                           │
```

### 技术栈

| 组件 | 技术选型 | 作用 |
|------|---------|------|
| OAuth 提供方 | GitHub OAuth App | 第三方身份认证 |
| 后端框架 | Express + MongoDB | API 服务与数据存储 |
| 认证方式 | JWT | 无状态身份令牌 |
| HTTP 请求 | Node.js 内置 https 模块 | 调用 GitHub API（无需额外依赖） |
| 前端框架 | Umi + React + Ant Design | 用户界面 |
| 状态管理 | Umi Model（基于 hooks） | GitHub 用户登录状态 |

## 三、GitHub OAuth App 申请

### 3.1 创建步骤

1. 登录 GitHub → Settings → Developer settings → OAuth Apps → **New OAuth App**
2. 填写信息：
   - **Application name**: `小丁的博客`
   - **Homepage URL**: `https://www.xiaodingyang.art`
   - **Authorization callback URL**: `https://www.xiaodingyang.art/api/github/callback`
3. 创建后获取 **Client ID** 和 **Client Secret**

### 3.2 环境变量配置

```bash
# backend/.env
GITHUB_CLIENT_ID=Ov23lizfZzQkPFatwEHC
GITHUB_CLIENT_SECRET=你的ClientSecret
GITHUB_CALLBACK_URL=https://www.xiaodingyang.art/api/github/callback
FRONTEND_URL=https://www.xiaodingyang.art
```

> 注意：`.env` 文件已被 `.gitignore` 忽略，CI/CD 部署时通过 `--exclude .env` 保护生产配置，需手动在服务器上配置。

## 四、后端实现

### 4.1 数据模型设计

#### GithubUser 模型

```javascript
// backend/src/models/GithubUser.js
{
  githubId: { type: Number, required: true, unique: true },  // GitHub 用户 ID
  username: { type: String, required: true },                 // GitHub login 名
  nickname: { type: String },                                 // 显示名称
  avatar:   { type: String },                                 // 头像 URL
  email:    { type: String },
  bio:      { type: String },
  htmlUrl:  { type: String },                                 // GitHub 个人主页
  status:   { type: String, enum: ['active', 'banned'], default: 'active' },
  lastLoginAt: { type: Date },
}
```

#### Comment 模型（文章评论）

```javascript
// backend/src/models/Comment.js
{
  articleId: { type: ObjectId, ref: 'Article', required: true },
  user:      { type: ObjectId, ref: 'GithubUser', required: true },
  content:   { type: String, required: true, maxlength: 500 },
  status:    { type: String, enum: ['pending', 'approved', 'rejected'], default: 'approved' },
}
```

#### Message 模型改造

原来的留言板是匿名的（nickname + email），改造后新增 `user` 字段关联 GithubUser：

```javascript
// 新增字段
user: { type: ObjectId, ref: 'GithubUser' }
// nickname 和 email 改为可选，兼容旧数据
```

### 4.2 OAuth 认证流程

核心文件：`backend/src/routes/githubAuth.js`

#### 第一步：发起授权（GET /api/github/login）

```javascript
router.get('/login', (req, res) => {
  const state = crypto.randomBytes(16).toString('hex');  // CSRF 防护
  const returnUrl = req.query.returnUrl || '/';
  stateStore.set(state, { returnUrl, createdAt: Date.now() });

  const params = new URLSearchParams({
    client_id: GITHUB_CLIENT_ID,
    redirect_uri: GITHUB_CALLBACK_URL,
    scope: 'read:user user:email',
    state,
  });

  res.redirect(`https://github.com/login/oauth/authorize?${params}`);
});
```

**关键点**：
- `state` 参数用于防止 CSRF 攻击，存储在内存 Map 中并设置 5 分钟过期
- `scope` 只申请 `read:user` 和 `user:email`，最小权限原则
- `returnUrl` 记录用户登录前的页面，登录完成后回到原位

#### 第二步：处理回调（GET /api/github/callback）

```
GitHub 回调 → 验证 state → code 换 access_token → 获取用户信息 → 创建/更新用户 → 签发 JWT → 重定向回前端
```

核心逻辑：

```javascript
// 1. 用 code 换 access_token
const tokenData = await httpsRequest('https://github.com/login/oauth/access_token', {
  method: 'POST',
  body: JSON.stringify({ client_id, client_secret, code }),
});

// 2. 用 access_token 获取用户信息
const githubUserInfo = await httpsRequest('https://api.github.com/user', {
  headers: { 'Authorization': `Bearer ${tokenData.access_token}` },
});

// 3. 创建或更新数据库中的用户
let user = await GithubUser.findOne({ githubId: githubUserInfo.id });
if (user) { /* 更新 */ } else { /* 创建 */ }

// 4. 签发 JWT（type: 'github' 区分管理员和普通用户）
const token = jwt.sign(
  { id: user._id, type: 'github', githubId: user.githubId },
  jwtConfig.secret,
  { expiresIn: jwtConfig.expiresIn }
);

// 5. 重定向回前端，通过 URL 参数传递 token 和用户信息
res.redirect(`${FRONTEND_URL}${returnUrl}?github_token=${token}&github_user=${userInfo}`);
```

#### 为什么不用 axios？

项目没有安装 axios，为避免依赖安装问题（npm peer dependency 冲突），直接使用 Node.js 内置 `https` 模块封装了一个简单的 `httpsRequest` 方法：

```javascript
function httpsRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, { ... }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => resolve(JSON.parse(data)));
    });
    req.on('error', reject);
    if (options.body) req.write(options.body);
    req.end();
  });
}
```

### 4.3 JWT 双类型认证体系

改造前只有管理员一种用户，改造后需要区分两种身份：

| JWT type | 用户模型 | 用途 |
|----------|---------|------|
| `admin` (默认) | User | 后台管理 |
| `github` | GithubUser | 前台评论/留言 |

核心中间件（`backend/src/middlewares/auth.js`）：

```javascript
// 管理员认证（原有 auth 中间件增加 type 判断）
const auth = async (req, res, next) => {
  const decoded = jwt.verify(token, secret);
  if (decoded.type === 'github') {
    return res.status(403).json({ message: '需要管理员权限' });
  }
  const user = await User.findById(decoded.id);
  req.user = user;
  next();
};

// 新增：GitHub 用户认证
const githubAuth = async (req, res, next) => {
  const decoded = jwt.verify(token, secret);
  if (decoded.type !== 'github') {
    return res.status(403).json({ message: '需要 GitHub 登录' });
  }
  const user = await GithubUser.findById(decoded.id);
  if (user.status === 'banned') {
    return res.status(403).json({ message: '账号已被封禁' });
  }
  req.githubUser = user;
  next();
};
```

### 4.4 API 路由一览

#### 公开路由

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/github/login` | 发起 GitHub OAuth 授权 |
| GET | `/api/github/callback` | GitHub 回调处理 |
| GET | `/api/github/userinfo` | 获取当前 GitHub 用户信息 |
| GET | `/api/comments/article/:id` | 获取文章评论列表 |

#### 需要 GitHub 登录

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/comments` | 发表文章评论 |
| POST | `/api/messages` | 提交留言 |

#### 后台管理（需要管理员权限）

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/admin/users` | GitHub 用户列表 |
| PUT | `/api/admin/users/:id/status` | 封禁/解封用户 |
| DELETE | `/api/admin/users/:id` | 删除用户及关联数据 |
| GET | `/api/admin/comments` | 评论列表 |
| PUT | `/api/admin/comments/:id/review` | 审核评论 |
| DELETE | `/api/admin/comments/:id` | 删除评论 |

## 五、前端实现

### 5.1 GitHub 用户状态管理

核心文件：`frontend/src/models/githubUserModel.ts`

```typescript
export default function useGithubUserModel() {
  // 从 localStorage 恢复状态
  const [githubUser, setGithubUser] = useState<GithubUserInfo | null>(/* from localStorage */);
  const [githubToken, setGithubToken] = useState<string | null>(/* from localStorage */);

  const isLoggedIn = !!(githubToken && githubUser);

  // 登录：存储到 localStorage + state
  const login = useCallback((token, user) => { ... }, []);

  // 退出：清除 localStorage + state
  const logout = useCallback(() => { ... }, []);

  // 权限守卫：已登录执行回调，未登录弹出登录弹窗
  const requireAuth = useCallback((callback?) => {
    if (isLoggedIn) { callback?.(); return true; }
    setLoginModalVisible(true);
    return false;
  }, [isLoggedIn]);

  // 从 URL 参数解析 OAuth 回调结果
  useEffect(() => {
    const url = new URL(window.location.href);
    const token = url.searchParams.get('github_token');
    const userStr = url.searchParams.get('github_user');
    if (token && userStr) {
      login(token, JSON.parse(decodeURIComponent(userStr)));
      // 清理 URL 参数
      url.searchParams.delete('github_token');
      url.searchParams.delete('github_user');
      window.history.replaceState({}, '', url.pathname + url.search + url.hash);
    }
  }, []);

  return { githubUser, githubToken, isLoggedIn, loginModalVisible, setLoginModalVisible, login, logout, requireAuth };
}
```

**设计思路**：
- 用 `localStorage` 持久化登录状态，刷新页面不会丢失
- OAuth 回调通过 URL 参数传递 token，前端解析后立即清理 URL（避免 token 泄露在地址栏）
- `requireAuth` 是统一的权限守卫，所有需要登录的操作都通过它拦截

### 5.2 登录弹窗组件

核心文件：`frontend/src/components/GithubLoginModal/index.tsx`

- 展示 GitHub 图标和"使用 GitHub 登录"按钮
- 功能说明：评论、复制、分享
- 使用博客主题色（通过 `colorModel` 获取当前主题）
- 点击登录跳转到 `GET /api/github/login?returnUrl=当前页面`

### 5.3 权限拦截实现

#### 评论拦截

```tsx
// 文章详情页 - 已登录显示评论框，未登录显示登录提示
{isLoggedIn ? (
  <div className="flex gap-3">
    <Avatar src={githubUser?.avatar} />
    <TextArea ... />
    <Button onClick={handleSubmitComment}>发表评论</Button>
  </div>
) : (
  <div onClick={() => requireAuth()}>
    登录 GitHub 后即可发表评论
  </div>
)}
```

#### 复制文本拦截

```tsx
// FrontLayout.tsx - 全局监听 copy 事件
useEffect(() => {
  if (isLoggedIn) return;
  const handleCopy = (e: ClipboardEvent) => {
    e.preventDefault();           // 阻止复制
    message.info('登录后即可复制内容');
    setLoginModalVisible(true);   // 弹出登录弹窗
  };
  document.addEventListener('copy', handleCopy);
  return () => document.removeEventListener('copy', handleCopy);
}, [isLoggedIn]);
```

#### 分享拦截

```tsx
// ShareButton/index.tsx - 点击分享时检查登录状态
const handleOpenChange = (newOpen: boolean) => {
  if (newOpen && !isLoggedIn) {
    requireAuth();  // 未登录弹出登录弹窗
    return;
  }
  setOpen(newOpen);
};
```

#### 首次访问提示

```tsx
// FrontLayout.tsx - 3 秒后自动弹出，sessionStorage 控制只弹一次
useEffect(() => {
  if (!isLoggedIn && !sessionStorage.getItem('login_prompt_shown')) {
    const timer = setTimeout(() => {
      setLoginModalVisible(true);
      sessionStorage.setItem('login_prompt_shown', '1');
    }, 3000);
    return () => clearTimeout(timer);
  }
}, [isLoggedIn]);
```

### 5.4 导航栏用户状态

```
未登录：显示主题色"登录"按钮
已登录：显示 GitHub 头像 + 昵称，下拉菜单可跳转 GitHub 主页或退出登录
```

### 5.5 后台管理新增页面

| 页面 | 路径 | 功能 |
|------|------|------|
| 用户管理 | `/admin/users` | 查看/搜索/封禁/解封/删除 GitHub 用户 |
| 评论管理 | `/admin/comments` | 查看/审核/删除文章评论 |

## 六、遇到的问题与解决

### 6.1 npm 安装 axios 失败

**问题**：项目 node_modules 中存在 peer dependency 冲突，`npm install axios` 报 `ERESOLVE` 错误。

**解决**：放弃安装 axios，改用 Node.js 内置 `https` 模块封装 HTTP 请求函数，零依赖实现。

### 6.2 后台仪表盘崩溃

**问题**：Message 模型改造后 `nickname` 变为可选字段，但仪表盘和留言管理页仍直接调用 `msg.nickname.charCodeAt(0)`，导致 `TypeError: Cannot read properties of undefined`。

**解决**：所有使用 `nickname` 的地方改为优先读取关联的 GithubUser 信息：
```javascript
const name = msg.user?.nickname || msg.user?.username || msg.nickname || '匿名';
```

### 6.3 生产环境 .env 配置

**问题**：`.env` 被 gitignore 忽略，CI/CD 部署时也用 `--exclude .env` 排除，生产服务器上缺少 GitHub OAuth 配置。

**解决**：通过 SSH 手动在服务器 `/var/www/myblog/backend/.env` 中追加配置。

### 6.4 弹窗样式与博客主题不协调

**问题**：登录弹窗和导航栏按钮使用固定的 GitHub 黑色（#24292e），与博客主题色不搭配。

**解决**：引入 `colorModel` 获取当前主题色，图标背景、标题、按钮等全部使用 `currentColorTheme.gradient` 和 `currentColorTheme.primary`。

## 七、安全考虑

| 安全措施 | 说明 |
|---------|------|
| CSRF 防护 | OAuth state 参数随机生成，5 分钟过期 |
| Token 安全 | GitHub access_token 仅在后端使用，不暴露给前端 |
| JWT 类型隔离 | `type: 'github'` 和 `type: 'admin'` 严格区分，防止权限越权 |
| 封禁机制 | `githubAuth` 中间件会校验用户 status，拒绝已封禁用户的请求 |
| 敏感信息保护 | Client Secret 存放在 .env 中，不提交到 Git |
| URL 参数清理 | 前端接收 OAuth 回调后立即从 URL 中移除 token 参数 |
| 最小权限 | OAuth scope 仅申请 `read:user user:email`，不操作用户仓库 |

## 八、文件变更清单

### 后端新增文件

| 文件 | 说明 |
|------|------|
| `backend/src/models/GithubUser.js` | GitHub 用户模型 |
| `backend/src/models/Comment.js` | 文章评论模型 |
| `backend/src/routes/githubAuth.js` | GitHub OAuth 路由 |
| `backend/src/routes/comments.js` | 评论路由 |
| `backend/src/controllers/commentController.js` | 评论控制器 |
| `backend/src/controllers/githubUserController.js` | 用户管理控制器 |

### 后端修改文件

| 文件 | 改动 |
|------|------|
| `backend/.env` | 新增 GitHub OAuth 配置 |
| `backend/src/models/index.js` | 导出新模型 |
| `backend/src/models/Message.js` | 新增 user 字段，nickname/email 改为可选 |
| `backend/src/middlewares/auth.js` | 新增 githubAuth 中间件 |
| `backend/src/routes/index.js` | 注册新路由 |
| `backend/src/routes/messages.js` | 留言需 GitHub 登录 |
| `backend/src/routes/admin.js` | 新增评论管理和用户管理路由 |
| `backend/src/controllers/messageController.js` | 适配 GitHub 用户 + populate |

### 前端新增文件

| 文件 | 说明 |
|------|------|
| `frontend/src/models/githubUserModel.ts` | GitHub 用户状态管理 |
| `frontend/src/components/GithubLoginModal/index.tsx` | 登录弹窗组件 |
| `frontend/src/pages/admin/users/index.tsx` | 后台用户管理页面 |
| `frontend/src/pages/admin/comments/index.tsx` | 后台评论管理页面 |

### 前端修改文件

| 文件 | 改动 |
|------|------|
| `frontend/.umirc.ts` | 新增路由 |
| `frontend/src/layouts/FrontLayout.tsx` | 复制拦截、首次弹窗、导航栏登录状态 |
| `frontend/src/layouts/AdminLayout.tsx` | 侧边栏新增菜单项 |
| `frontend/src/pages/articles/detail.tsx` | 评论区改为 GitHub 登录评论 |
| `frontend/src/pages/message/index.tsx` | 留言板改为需要 GitHub 登录 |
| `frontend/src/components/ShareButton/index.tsx` | 分享需要登录 |
| `frontend/src/pages/admin/dashboard/index.tsx` | 兼容新留言数据结构 |
| `frontend/src/pages/admin/messages/index.tsx` | 兼容新留言数据结构 |

## 九、关键学习点

1. **OAuth 2.0 授权码模式**：理解 authorize → callback → code 换 token → 获取用户信息的完整流程
2. **JWT 多角色认证**：通过 payload 中的 type 字段区分用户类型，同一套 JWT 支持多种身份
3. **CSRF 防护**：OAuth 中 state 参数的作用和实现方式
4. **零依赖 HTTP 请求**：使用 Node.js 内置模块替代第三方库，减少依赖冲突
5. **数据模型演进**：在不破坏旧数据的前提下扩展模型（字段改为可选 + 兼容读取）
6. **前端权限拦截模式**：`requireAuth` 统一守卫 + 全局事件监听的组合方案
