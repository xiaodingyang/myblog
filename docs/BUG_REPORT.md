# Myblog 前端项目 Bug 报告

## 🔴 严重问题

### 1. 评论提交时 githubToken 可能为 null（文章详情页）
**文件**: `src/pages/articles/detail.tsx`
**位置**: `handleSubmitComment` 函数
**问题**: 
```typescript
const handleSubmitComment = () => {
  requireAuth(async () => {
    // ...
    const res = await request('/api/comments', {
      method: 'POST',
      headers: { Authorization: `Bearer ${githubToken}` }, // githubToken 可能为 null
      data: { articleId: id, content: commentContent.trim() },
    });
```
当 `githubToken` 为 null 时，API 请求的 Authorization header 会是 `Bearer null`，导致请求失败。

**修复建议**: 在 `requireAuth` 的回调中再次检查 `isLoggedIn`，或确保 `requireAuth` 只有在已登录时才调用回调。

---

### 2. 留言提交同样的问题
**文件**: `src/pages/message/index.tsx`
**位置**: `handleSubmit` 函数
**问题**: 同上，`githubToken` 可能为 null

---

### 3. GitHub 登录 Modal 从未实际显示
**文件**: `src/models/githubUserModel.ts`
**问题**: `requireAuth` 函数会设置 `setLoginModalVisible(true)`，但在所有页面中都没看到实际渲染这个 Modal 的代码。登录流程不完整。

**修复建议**: 需要在 `FrontLayout` 或相关布局组件中添加 GitHub 登录 Modal 的渲染逻辑。

---

## 🟡 中等问题

### 4. `requestIdleCallback` polyfill 未正确清理
**文件**: `src/pages/home/index.tsx`
**位置**: `useEffect` 中的数据获取逻辑
**问题**:
```typescript
} else {
  const timer = setTimeout(fetchData, 200);
  return () => clearTimeout(timer);
}
```
当组件 unmount 或依赖变化时，`fetchData` 函数引用可能已变化，但 timer 仍在 200ms 后执行旧的 `fetchData`。

**修复建议**: 将 `fetchData` 放入 `useCallback` 并添加到依赖数组，或使用 ref 保存最新的 fetchData。

---

### 5. ColorModel useEffect 潜在循环
**文件**: `src/models/colorModel.ts`
**问题**:
```typescript
useEffect(() => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved && saved !== themeId) {
    setThemeId(saved); // 可能触发重新渲染，导致循环
  }
}, []);
```
这个 effect 没有任何依赖，且只在 mount 时运行一次是合理的。但如果 `themeId` 在其他地方被重置，可能会有问题。建议添加条件防止循环。

---

### 6. 文章编辑页 `handleSaveDraft` 验证逻辑问题
**文件**: `src/pages/admin/articles/edit.tsx`
**位置**: `handleSaveDraft` 函数
**问题**:
```typescript
const handleSaveDraft = () => {
  form.validateFields(['title', 'content']).then(() => { // 只验证 title 和 content
    handleSubmit(form.getFieldsValue(), 'draft');
  });
};
```
只验证了 `title` 和 `content`，但 `category` 是必填字段（在 Form.Item rules 中定义了），保存草稿时可能缺少分类。

---

### 7. 首页 sections 滚动计算问题
**文件**: `src/pages/home/index.tsx`
**位置**: `scrollToSection` 和 `getActualSectionHeight`
**问题**:
```typescript
const getActualSectionHeight = () => window.innerHeight - 64; // 硬编码减去 64px
```
假设导航栏高度永远是 64px，但如果导航栏高度变化（响应式设计），会导致滚动位置不准确。

---

### 8. 分享按钮在 ArticleCard 中被包裹在阻止默认事件的 span 内
**文件**: `src/components/ArticleCard/index.tsx`
**位置**: 底部信息栏
**问题**:
```tsx
<span onClick={(e) => e.preventDefault()}>  // 这里阻止了默认事件
  <ShareButton ... />
</span>
```
`e.preventDefault()` 可能阻止了 ShareButton 的正常交互。建议移除这个 span 的事件处理或重新设计布局。

---

## 🟢 轻微问题

### 9. 文章列表分页只在桌面端显示总数
**文件**: `src/pages/articles/index.tsx`
**问题**:
```tsx
showTotal={(total, range) => (
  <span className="hidden md:inline">共 {total} 篇文章</span>
)}
```
移动端用户无法看到文章总数信息。

---

### 10. 后台登录页错误处理过于简单
**文件**: `src/pages/admin/login.tsx`
**问题**:
```typescript
} catch (error: any) {
  // handled by global errorHandler
}
```
没有自定义错误提示，用户体验不佳。

---

### 11. 首页热门推荐文章可能少于 3 篇时数组越界
**文件**: `src/pages/home/index.tsx`
**位置**: featuredArticles 渲染
**问题**: 如果文章数量少于 3 篇，访问 `featuredArticles[1]` 和 `featuredArticles[2]` 可能出问题。虽然有 `slice(1, 3)` 保护，但 `featuredArticles[0]` 本身可能不存在。

---

### 12. 后台仪表盘统计卡片布局问题
**文件**: `src/pages/admin/dashboard/index.tsx`
**问题**:
```tsx
<Col xs={12} sm={8} lg={index < 4 ? 6 : 24} xl={index < 4 ? 6 : 6} key={item.title}>
```
`lg={index < 4 ? 6 : 24}` 表示第 5 个卡片（index=4）在 lg 屏幕上占满宽，但 5 个卡片的布局不一致。

---

## 📋 修复优先级

1. **高优先级**: Bug #1, #2, #3（认证/授权相关）
2. **中优先级**: Bug #4, #6, #7, #8（功能性问题）
3. **低优先级**: Bug #5, #9, #10, #11, #12（体验/边缘情况）

---

*报告生成时间: 2026-03-26*
