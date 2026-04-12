# UI 优化任务 - P1 阶段

## 项目路径
`C:\Users\34662\Desktop\work\myblog\frontend`

## 任务目标
实施 xiaodingyang.art 的 P1 优先级 UI 优化：
1. 毛玻璃主题配色
2. 视觉升级（悬停动效、圆角统一）

## 详细需求

### 1. 毛玻璃主题配色（P1）

**目标：** 为卡片、导航栏、弹窗应用毛玻璃效果

**核心样式：**
```css
background: rgba(255, 255, 255, 0.75);
backdrop-filter: blur(12px);
-webkit-backdrop-filter: blur(12px);
border: 1px solid rgba(255, 255, 255, 0.3);
```

**主题色更新：**
- 主色调：`#6366f1`（蓝紫色系，Indigo-500）
- 渐变：`linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)`

**应用范围：**

1. **卡片组件（Card）**
   - 文章列表卡片
   - 文章详情卡片
   - 评论区卡片
   - 相关推荐卡片

2. **导航栏（Header）**
   - 顶部导航栏背景
   - 移动端菜单

3. **弹窗（Modal）**
   - GitHub 登录弹窗
   - 全局搜索弹窗
   - 分享弹窗

4. **Toast 提示**
   - 使用毛玻璃背景
   - 确保文字可读性

**实施步骤：**

1. 修改 `src/global.css`：
   - 添加全局毛玻璃样式类 `.glass-card`
   - 更新主题色 CSS 变量 `--theme-primary`
   - 添加浏览器兼容性前缀

2. 修改卡片组件样式：
   - 文章列表页：`src/pages/articles/index.tsx`
   - 文章详情页：`src/pages/articles/detail.tsx`
   - 首页卡片：`src/pages/index.tsx`

3. 修改导航栏：
   - `src/layouts/FrontLayout.tsx`
   - 确保透明背景 + 毛玻璃效果

4. 修改弹窗组件：
   - `src/components/shared/GithubLoginModal/index.tsx`
   - `src/components/shared/GlobalSearch/index.tsx`
   - Ant Design Modal 全局样式覆盖

**浏览器兼容性：**
```css
/* 标准语法 */
backdrop-filter: blur(12px);

/* Safari 兼容 */
-webkit-backdrop-filter: blur(12px);

/* 降级方案（不支持 backdrop-filter 的浏览器） */
@supports not (backdrop-filter: blur(12px)) {
  background: rgba(255, 255, 255, 0.95);
}
```

### 2. 视觉升级（P1）

**卡片悬停动效：**
```css
.card-hover {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.card-hover:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(99, 102, 241, 0.15);
}
```

**圆角统一：**
- 卡片：`border-radius: 16px`
- 按钮：`border-radius: 8px`
- 输入框：`border-radius: 8px`
- 标签：`border-radius: 6px`

**响应式适配：**
- 移动端（< 768px）：
  - 卡片圆角减小到 `12px`
  - 悬停效果改为点击反馈
  - 毛玻璃模糊度降低到 `8px`（性能优化）

**实施步骤：**

1. 更新 `src/global.css` 中的 `.card-hover` 类
2. 为所有卡片添加 `card-hover` 类名
3. 统一圆角值（搜索 `border-radius` 并替换）
4. 添加移动端媒体查询

## 验收标准

- ✅ 卡片、导航栏、弹窗显示毛玻璃效果
- ✅ 主题色更新为 `#6366f1`
- ✅ 卡片悬停时上移 4px 并显示阴影
- ✅ 圆角统一（卡片 16px，按钮 8px）
- ✅ Chrome、Safari、Firefox 显示正常
- ✅ 移动端布局无错位，性能流畅

## 注意事项

- 毛玻璃效果需要背景有内容才能显示，确保页面有背景图或渐变
- Safari 需要 `-webkit-` 前缀
- 移动端降低模糊度以提升性能
- 深色背景上的毛玻璃需要调整透明度和边框颜色

## 测试清单

1. 桌面端 Chrome：毛玻璃效果 + 悬停动效
2. 桌面端 Safari：毛玻璃效果（-webkit- 前缀）
3. 移动端：降级模糊度，点击反馈
4. 不支持 backdrop-filter 的浏览器：降级到半透明背景
