import React from 'react';
import { LazyMotionDiv, LazyAnimatePresence } from '@/utils/lazyMotion';
import { prefersReducedMotion } from '@/utils/motionPrefs';

interface PageTransitionProps {
  children: React.ReactNode;
  /** 路由路径，用于 AnimatePresence 的 key */
  locationKey: string;
}

const PageTransition: React.FC<PageTransitionProps> = ({ children, locationKey }) => {
  // 首页使用 scroll-snap，跳过过渡动画
  if (locationKey === '/' || prefersReducedMotion()) {
    return <>{children}</>;
  }

  return (
    <LazyAnimatePresence mode="wait">
      <LazyMotionDiv
        key={locationKey}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{
          duration: 0.3,
          ease: [0.25, 0.1, 0.25, 1],
        }}
      >
        {children}
      </LazyMotionDiv>
    </LazyAnimatePresence>
  );
};

export default PageTransition;
