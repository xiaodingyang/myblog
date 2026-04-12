# myblog 项目首屏加载性能优化任务

## 任务背景
当前性能指标：
- Performance Score: 65/100 (目标 ≥85)
- FCP: 2.2s (目标 <1.8s)
- LCP: 3.0s (目标 <2.5s)
- Speed Index: 5.8s (目标 <3.4s)

三大瓶颈：
1. vendors.js 1MB，JS 执行 834ms
2. 6张大图 700KB，未使用 WebP
3. 主线程阻塞严重

## P0 优化任务（必须完成）

### 1. 优化代码分割策略
当前 `.umirc.ts` 已有基础分割配置，需要进一步优化：

**修改 `.umirc.ts` 的 chainWebpack 配置：**
```typescript
chainWebpack(config: any, { env }: any) {
  if (env === 'production') {
    config.optimization.minimize(true);

    config.optimization.splitChunks({
      chunks: 'all',
      maxInitialRequests: 30, // 增加到 30
      minSize: 15000, // 降低到 15KB，更细粒度分割
      maxSize: 244000, // 新增：单个 chunk 最大 244KB
      cacheGroups: {
        // React 核心库（最高优先级）
        react: {
          name: 'react',
          test: /[\\/]node_modules[\\/](react|react-dom|react-router|react-router-dom|scheduler)[\\/]/,
          priority: 40,
          enforce: true,
        },
        // Ant Design 核心
        antdCore: {
          name: 'antd-core',
          test: /[\\/]node_modules[\\/](antd[\\/]es[\\/](button|input|form|message|notification|modal))[\\/]/,
          priority: 35,
        },
        // Ant Design 其他组件
        antdOther: {
          name: 'antd-other',
          test: /[\\/]node_modules[\\/](antd|@ant-design[\\/]icons)[\\/]/,
          priority: 30,
        },
        // Markdown 渲染相关
        markdown: {
          name: 'markdown',
          test: /[\\/]node_modules[\\/](react-markdown|remark-gfm|rehype-raw|rehype-highlight|unified|micromark)[\\/]/,
          priority: 28,
        },
        // 代码高亮
        syntax: {
          name: 'syntax',
          test: /[\\/]node_modules[\\/](react-syntax-highlighter|refractor|prismjs|highlight\.js)[\\/]/,
          priority: 28,
        },
        // 图表库
        charts: {
          name: 'charts',
          test: /[\\/]node_modules[\\/](@ant-design[\\/]charts|@antv)[\\/]/,
          priority: 26,
        },
        // 粒子效果和 3D
        particles: {
          name: 'particles',
          test: /[\\/]node_modules[\\/](@xdy-npm|@tsparticles|three)[\\/]/,
          priority: 26,
        },
        // 动画库
        motion: {
          name: 'motion',
          test: /[\\/]node_modules[\\/]framer-motion[\\/]/,
          priority: 26,
        },
        // 其他第三方库
        vendors: {
          name: 'vendors',
          test: /[\\/]node_modules[\\/]/,
          priority: 10,
          minSize: 10000,
          maxSize: 200000, // 限制单个 vendor chunk 大小
        },
      },
    });

    // 启用 Tree Shaking
    config.optimization.usedExports(true);
    config.optimization.sideEffects(true);
  }
}
```

### 2. 启用 Terser 压缩优化
在 `.umirc.ts` 中添加：
```typescript
export default defineConfig({
  // ... 其他配置
  
  jsMinifier: 'terser',
  jsMinifierOptions: {
    compress: {
      drop_console: true, // 移除 console
      drop_debugger: true,
      pure_funcs: ['console.log', 'console.info', 'console.debug'],
      passes: 2, // 多次压缩
    },
    mangle: {
      safari10: true,
    },
  },
  
  // CSS 压缩
  cssMinifier: 'cssnano',
  cssMinifierOptions: {
    preset: [
      'default',
      {
        discardComments: { removeAll: true },
        normalizeWhitespace: true,
      },
    ],
  },
});
```

### 3. 图片优化 - 添加懒加载组件
创建 `src/components/LazyImage/index.tsx`：
```tsx
import React, { useState, useEffect, useRef } from 'react';
import { Skeleton } from 'antd';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number | string;
  height?: number | string;
  placeholder?: React.ReactNode;
  threshold?: number;
}

const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  className = '',
  width,
  height,
  placeholder,
  threshold = 100,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (!imgRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: `${threshold}px`,
      }
    );

    observer.observe(imgRef.current);

    return () => observer.disconnect();
  }, [threshold]);

  return (
    <div
      ref={imgRef}
      className={className}
      style={{ width, height, position: 'relative' }}
    >
      {!isLoaded && (
        placeholder || (
          <Skeleton.Image
            active
            style={{ width: '100%', height: '100%' }}
          />
        )
      )}
      {isInView && (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          onLoad={() => setIsLoaded(true)}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: isLoaded ? 'block' : 'none',
          }}
        />
      )}
    </div>
  );
};

export default LazyImage;
```

### 4. 替换首页大图为懒加载
找到首页组件（可能在 `src/pages/home/index.tsx`），将所有 `<img>` 标签替换为 `<LazyImage>`：

**示例修改：**
```tsx
// 旧代码
<img src="https://picsum.photos/1200/630" alt="..." />

// 新代码
import LazyImage from '@/components/LazyImage';

<LazyImage 
  src="https://picsum.photos/1200/630" 
  alt="..."
  width="100%"
  height="630px"
  threshold={200}
/>
```

### 5. 添加关键资源预加载
在 `.umirc.ts` 的 `links` 配置中添加：
```typescript
links: [
  { rel: 'icon', href: '/favicon.png', type: 'image/png' },
  { rel: 'preconnect', href: 'https://www.xiaodingyang.art' },
  { rel: 'preconnect', href: 'https://fastly.picsum.photos' }, // 新增：图片 CDN
  { rel: 'dns-prefetch', href: 'https://www.xiaodingyang.art' },
  { rel: 'dns-prefetch', href: 'https://fastly.picsum.photos' }, // 新增
  { rel: 'preload', href: '/umi.css', as: 'style' },
],
```

## P1 优化任务（尽量完成）

### 6. 确保路由懒加载
检查 `src/pages` 下所有页面组件，确保没有在 layout 中直接 import，应该通过 Umi 路由配置自动懒加载。

### 7. 添加动态 import 示例
对于大型组件（如图表、编辑器），使用动态导入：
```tsx
import { lazy, Suspense } from 'react';
import { Spin } from 'antd';

const HeavyChart = lazy(() => import('@/components/HeavyChart'));

// 使用时
<Suspense fallback={<Spin />}>
  <HeavyChart />
</Suspense>
```

## 验证步骤

1. 执行构建：`pnpm build`
2. 检查 `dist` 目录，确认：
   - vendors.js 被拆分为多个小文件
   - 单个 chunk 不超过 300KB
3. 本地启动生产构建：`cd dist && npx serve`
4. 运行 Lighthouse：`pnpm lhci`
5. 对比优化前后的报告

## 预期效果
- vendors.js 从 1MB 拆分为 5-8 个 chunk，每个 < 250KB
- 首屏 JS 加载量减少 40-50%
- Performance Score 提升到 85+
- FCP < 1.8s, LCP < 2.5s

## 注意事项
1. 修改配置后需要重新构建才能看到效果
2. 开发模式下 MFSU 会自行管理分割，看不到最终效果
3. 图片懒加载只对非首屏图片生效
4. 保持代码可读性，不要过度优化

## 完成标准
- ✅ 所有 P0 任务完成
- ✅ 构建成功，无报错
- ✅ Lighthouse Performance Score ≥ 85
- ✅ 代码提交到 git
