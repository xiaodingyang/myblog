# 后台管理页面 Bug 报告

## 🔴 严重问题

### 1. 设置页面头像上传后 profile 更新失败时不提示用户
**文件**: `src/pages/admin/settings/index.tsx`
**位置**: `handleAvatarUpload` 函数
**问题**: 
```typescript
const profileRes = await request<API.Response<API.User>>('/api/auth/profile', {
  method: 'PUT',
  data: { /* ... */ },
});
if (profileRes.code === 0) {
  // 成功
  message.success('头像更新成功');
} else {
  message.success('头像上传成功，请点击保存修改同步'); // ❌ 错误！应该是 error
}
```
当 profile API 失败时，给用户提示"成功"是错误的，用户会以为已经保存了。

---

### 2. 设置页面 - useEffect 中 avatarUrl 依赖可能导致问题
**文件**: `src/pages/admin/settings/index.tsx`
**位置**: `useEffect` for profileForm
**问题**:
```typescript
useEffect(() => {
  if (initialState?.currentUser) {
    profileForm.setFieldsValue({ /* ... */ });
    if (initialState.currentUser.avatar && !avatarUrl) {
      setAvatarUrl(initialState.currentUser.avatar);
    }
  }
}, [initialState?.currentUser, profileForm]);
```
`avatarUrl` 在依赖数组中，但 `profileForm` 是变化的（每次 render 都会新创建？实际上 Form 实例是稳定的）。但更严重的是：如果 `avatarUrl` 被用户手动设置后，`!avatarUrl` 条件不再满足，不会覆盖用户的选择，这是对的。但反过来如果有其他地方重置了 avatarUrl，可能会有问题。

---

## 🟡 中等问题

### 3. 留言管理 Modal footer 数组元素没有 key
**文件**: `src/pages/admin/messages/index.tsx`
**位置**: Modal 的 footer 属性
**问题**:
```tsx
footer={[
  <Button key="close" onClick={() => setPreviewMessage(null)}>关闭</Button>,
  previewMessage?.status === 'pending' && (  // 没有 key！
    <Button key="approve" type="primary" ...>
      审核通过
    </Button>
  ),
]}
```
React 要求 footer 数组中的每个元素都有 key。虽然不是功能 bug，但会产生 console warning。

---

### 4. 后台管理布局 - useEffect 检查 token 时无依赖数组
**文件**: `src/layouts/AdminLayout.tsx`
**位置**: 认证检查 useEffect
**问题**:
```typescript
useEffect(() => {
  const token = localStorage.getItem('token');
  if (!token) {
    message.warning('请先登录');
    navigate('/admin/login');
  }
}, [navigate]);
```
只在 mount 时检查一次，这是合理的。但 message.warning 在组件 render 阶段调用可能不合适（应该是在交互中调用）。虽然能用，但可能在控制台产生 React 警告。

---

### 5. 评论管理页面 - 依赖数组为空但引用了状态变量
**文件**: `src/pages/admin/comments/index.tsx`
**位置**: `useEffect(() => { fetchComments(); }, []);`
**问题**: useEffect 依赖数组为空，所以只在 mount 时调用一次 `fetchComments()`。这本身是设计选择（只在页面加载时获取一次），但如果用户期望审核操作后自动刷新列表，那需要把 `page` 和 `pageSize` 加入依赖数组。不过实际上 `handleReview` 和 `handleDelete` 中已经手动调用了 `fetchComments()`，所以这个设计是有意的。

---

## 🟢 轻微问题

### 6. 用户管理页面 - 搜索功能每次手动传参
**文件**: `src/pages/admin/users/index.tsx`
**位置**: `handleSearch` 和 `fetchUsers`
**问题**:
```typescript
const handleSearch = () => {
  setPage(1);
  fetchUsers(1, pageSize, keyword);  // keyword 可能还没有更新
};
```
`setPage(1)` 是异步的，但 `fetchUsers` 是同步调用的，且 `keyword` 是直接从 state 读取的。这通常没问题，但如果 `setPage` 的异步特性导致问题，建议改成:
```typescript
const handleSearch = () => {
  setKeyword(prev => {  // 或者在 onChange 中同步更新
    setPage(1);
    return prev;
  });
};
```
实际上这个写法是正确的，因为 `fetchUsers` 使用的是当前 render 的 `keyword` 值（闭包），而不是等待状态更新。所以这不是 bug。

---

### 7. 分类/标签管理 - Modal 打开时没有重置表单错误状态
**文件**: `src/pages/admin/categories/index.tsx`, `src/pages/admin/tags/index.tsx`
**问题**: 当用户打开 Modal 填写表单并触发表单验证错误后，如果用户关闭 Modal 再重新打开，`form.resetFields()` 会重置字段值，但不会清除已显示的验证错误消息（直到用户再次输入）。这是 Ant Design Form 的已知行为，可以通过 `form.resetFields()` 后在 `onOpenChange` 中处理，或者在 Modal 打开时延迟清理。

---

## 📋 修复优先级

1. **高优先级**: Bug #1（头像上传错误提示）
2. **中优先级**: Bug #3（Modal footer key）
3. **低优先级**: Bug #4（AdminLayout message 调用位置）
