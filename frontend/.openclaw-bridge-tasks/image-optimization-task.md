# 图片优化任务 - LCP 性能提升

## 背景
当前 Performance Score 76，LCP 3.0s，需要优化首屏大图以达到 LCP < 2.5s 的目标。

## 任务目标
优化项目中使用的 picsum.photos 外部图片，提升 LCP 性能指标。

## 具体步骤

### 1. 创建图片资源目录
```bash
mkdir -p public/images/articles
```

### 2. 下载并优化示例图片
下载 3 张不同的示例图片（对应 create.tsx 和 edit.tsx 中的三种样式）：
- 普通图片
- 灰度图片  
- 模糊图片

使用 Python 或 Node.js 脚本：
1. 下载 `https://picsum.photos/seed/default/1200/630` 
2. 压缩到 800x420 分辨率
3. 转换为 WebP 格式
4. 保存到 `public/images/articles/` 目录

生成文件：
- `hero-default.webp`
- `hero-grayscale.webp` 
- `hero-blur.webp`

### 3. 修改代码引用
修改以下文件，将外部图片 URL 替换为本地 WebP 图片：

**src/pages/admin/articles/create.tsx**
**src/pages/admin/articles/edit.tsx**

将：
```typescript
return `https://picsum.photos/seed/${random}/1200/630`;
return `https://picsum.photos/seed/${random}/1200/630?grayscale`;
return `https://picsum.photos/seed/${random}/1200/630?blur=2`;
```

替换为：
```typescript
return `/images/articles/hero-default.webp`;
return `/images/articles/hero-grayscale.webp`;
return `/images/articles/hero-blur.webp`;
```

### 4. 添加图片懒加载和响应式支持
在使用这些图片的组件中：
1. 添加 `loading="lazy"` 属性（如果是 img 标签）
2. 配置响应式图片（srcset）支持不同屏幕尺寸
3. 添加 `fetchpriority="high"` 给首屏关键图片

### 5. 验证优化效果
```bash
# 重新构建
pnpm run build

# 运行 Lighthouse 测试
pnpm run lighthouse

# 对比优化前后的报告
```

## 验收标准
- ✅ LCP < 2.5s
- ✅ Performance Score ≥ 85
- ✅ FCP ≤ 1.8s
- ✅ 图片资源本地化，WebP 格式
- ✅ 配置懒加载和响应式加载

## 产出物
1. 优化后的 WebP 图片资源（public/images/articles/）
2. 修改后的代码文件（create.tsx, edit.tsx）
3. 新的 Lighthouse 报告（lighthouse-final.report.html）
4. 性能对比数据

## 注意事项
- 确保图片质量在压缩后仍然可接受（WebP quality 80-85）
- 保持图片宽高比 1200:630 → 800:420
- 测试不同页面的图片加载效果
- 如果有其他页面使用相同图片，一并优化
