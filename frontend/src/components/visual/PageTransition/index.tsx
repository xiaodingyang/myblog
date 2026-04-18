import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { prefersReducedMotion } from '@/utils/motionPrefs';

interface PageTransitionProps {
  children: React.ReactNode;
  /** 路由路径，用于 AnimatePresence 的 key */
  locationKey: string;
}

/**
 * 路由切换过渡。此处对 framer-motion 使用**同步 import**，避免与 React.lazy 叠在
 * Webpack async chunk 边界上时出现 `Cannot read properties of undefined (reading 'call')`
 *（线上非首页白屏）。其它页面内的 ScrollReveal 等仍可用 lazyMotion 减包体。
 */
const PageTransition: React.FC<PageTransitionProps> = ({ children, locationKey }) => {
  if (locationKey === '/' || prefersReducedMotion()) {
    return <>{children}</>;
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
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
      </motion.div>
    </AnimatePresence>
  );
};

export default PageTransition;
