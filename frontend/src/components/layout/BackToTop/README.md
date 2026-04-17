# ScrollToTop 返回顶部按钮组件

## 组件说明

ScrollToTop（BackToTop）是一个返回顶部按钮组件，提供平滑滚动到页面顶部的功能。

## 功能特性

1. **自动显示/隐藏**：滚动超过 300px 时自动显示按钮
2. **平滑滚动**：点击按钮使用原生 `behavior: 'smooth'` 平滑滚动到顶部
3. **Tailwind CSS 样式**：使用 Tailwind 工具类实现样式，支持响应式和动画效果
4. **性能优化**：使用 requestAnimationFrame 节流滚动事件监听
5. **特殊容器支持**：支持首页特殊滚动容器 `.home-fullscreen-scroll`
6. **无障碍访问**：包含 `aria-label` 属性，支持屏幕阅读器

## 使用方式

### 基础用法（固定定位）

```tsx
import BackToTop from '@/components/layout/BackToTop';

function App() {
  return (
    <div>
      {/* 页面内容 */}
      <BackToTop />
    </div>
  );
}
```

### 嵌入式用法（相对定位）

在悬浮按钮容器中使用：

```tsx
import BackToTop from '@/components/layout/BackToTop';

function Layout() {
  return (
    <div className="fixed z-[60] flex flex-col items-center" style={{ right: 16, bottom: 24, gap: 12 }}>
      <BackToTop embedded />
      {/* 其他悬浮按钮 */}
    </div>
  );
}
```

## Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| embedded | boolean | false | 是否嵌入到悬浮按钮容器中（使用相对定位） |

## 样式定制

组件使用 Tailwind CSS 类名，主要样式包括：

- **渐变背景**：`bg-gradient-to-br from-red-500 to-orange-500`
- **阴影效果**：`shadow-lg shadow-red-500/40`
- **悬停效果**：`hover:shadow-xl hover:scale-105`
- **过渡动画**：`transition-all duration-300 ease-in-out`

如需修改样式，可以直接编辑组件中的 className。

## 集成到主布局

组件已集成到 `FrontLayout.tsx` 中：

```tsx
// src/layouts/FrontLayout.tsx
import BackToTop from '@/components/layout/BackToTop';

// 在布局中使用
<div
  className="fixed z-[60] flex flex-col items-center"
  style={{ right: FAB_RIGHT_PX, bottom: FAB_KEYBOARD_BOTTOM_PX, gap: FAB_GAP_PX }}
>
  <BackToTop embedded />
  <ParticleThemeSelector isDark={isDarkTheme} embedded />
  <KeyboardHelpButton embedded />
</div>
```

## 技术实现

### 滚动检测

- 使用 `window.scrollY` 检测普通页面滚动
- 使用 `.home-fullscreen-scroll` 容器的 `scrollTop` 检测首页滚动
- 滚动超过 300px 时设置 `visible` 状态为 `true`

### 性能优化

使用 `requestAnimationFrame` 节流滚动事件：

```tsx
const onScroll = () => {
  if (rafRef.current) return;
  rafRef.current = requestAnimationFrame(() => {
    updateVisible();
    rafRef.current = 0;
  });
};
```

### 平滑滚动

使用原生 `scrollTo` API 的 `behavior: 'smooth'` 选项：

```tsx
window.scrollTo({ top: 0, behavior: 'smooth' });
```

## 浏览器兼容性

- 平滑滚动需要浏览器支持 `scroll-behavior: smooth`
- 现代浏览器（Chrome 61+, Firefox 36+, Safari 15.4+）均支持
- 不支持的浏览器会降级为瞬间跳转

## 注意事项

1. 组件会自动监听路由变化（`pathname`），确保在页面切换时重新检测滚动位置
2. 组件使用 `passive: true` 监听滚动事件，提升滚动性能
3. 组件在卸载时会自动清理事件监听器和 RAF 请求
