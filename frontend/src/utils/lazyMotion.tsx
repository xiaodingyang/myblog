/**
 * framer-motion 懒加载包装器
 *
 * 将 framer-motion 作为动态依赖，减少首屏 JS 体积约 45KB (gzip)。
 * 首次使用时才加载 framer-motion，后续使用缓存。
 */
import React, { lazy, Suspense, ComponentType } from 'react';

// framer-motion 模块缓存
let framerMotionCache: Promise<typeof import('framer-motion')> | null = null;

/**
 * 获取 framer-motion 模块（带缓存）
 */
function getFramerMotion() {
  if (!framerMotionCache) {
    framerMotionCache = import('framer-motion');
  }
  return framerMotionCache;
}

// 通用 fallback 组件
const DefaultFallback: React.FC = () => null;

// 通用 motion 组件 props 类型（支持 variants）
type MotionComponentProps = {
  className?: string;
  style?: React.CSSProperties;
  initial?: any;
  animate?: any;
  exit?: any;
  whileHover?: any;
  whileTap?: any;
  whileInView?: any;
  variants?: any;
  transition?: any;
  viewport?: any;
  children?: React.ReactNode;
  key?: any;
  [key: string]: any;
};

/**
 * 创建懒加载的 motion 组件
 *
 * @example
 * const LazyMotionDiv = createLazyMotionComponent('div');
 * // 使用方式与 motion.div 完全相同
 * <LazyMotionDiv initial={{ opacity: 0 }} animate={{ opacity: 1 }} />
 */
export function createLazyMotionComponent<T extends keyof JSX.IntrinsicElements>(
  element: T
): React.FC<MotionComponentProps> {
  const LazyComponent = lazy(async () => {
    const { motion } = await getFramerMotion();
    return { default: motion[element] as ComponentType<any> };
  });

  return ((props: MotionComponentProps) => (
    <Suspense fallback={<DefaultFallback />}>
      <LazyComponent {...props} />
    </Suspense>
  )) as any;
}

/**
 * 懒加载的 motion.div
 */
export const LazyMotionDiv = createLazyMotionComponent('div');

/**
 * 懒加载的 motion.span
 */
export const LazyMotionSpan = createLazyMotionComponent('span');

/**
 * 懒加载的 motion.button
 */
export const LazyMotionButton = createLazyMotionComponent('button');

/**
 * 懒加载的 motion.h1
 */
export const LazyMotionH1 = createLazyMotionComponent('h1');

/**
 * 懒加载 AnimatePresence
 *
 * @example
 * <LazyAnimatePresence mode="wait">
 *   <LazyMotionDiv key="page" ... />
 * </LazyAnimatePresence>
 */
export const LazyAnimatePresence: React.FC<{
  children?: React.ReactNode;
  mode?: 'sync' | 'wait' | 'popLayout';
  initial?: boolean;
  onExitComplete?: () => void;
}> = ((props: any) => {
  const LazyPresence = lazy(async () => {
    const { AnimatePresence } = await getFramerMotion();
    return { default: AnimatePresence as ComponentType<any> };
  });

  return (
    <Suspense fallback={<DefaultFallback />}>
      <LazyPresence {...props} />
    </Suspense>
  );
}) as any;

/**
 * 懒加载 motion 组件（通用）
 *
 * @example
 * const LazyMotion = createLazyMotion();
 * <LazyMotion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} />
 */
export function createLazyMotion() {
  const cache: Record<string, ComponentType<any>> = {};

  const handler: ProxyHandler<{}> = {
    get(_, prop: string) {
      if (!cache[prop]) {
        cache[prop] = createLazyMotionComponent(prop as any);
      }
      return cache[prop];
    },
  };

  return new Proxy({}, handler) as typeof import('framer-motion').motion;
}

/**
 * 预加载 framer-motion
 * 可在页面加载后调用，提前加载动画库
 */
export function preloadFramerMotion(): Promise<void> {
  return getFramerMotion().then(() => {});
}

export {
  getFramerMotion,
};
