import React from 'react';
import { motion, type Variants, type Transition } from 'framer-motion';
import { prefersReducedMotion, isMobileViewport } from '@/utils/motionPrefs';

interface ScrollRevealProps {
  children: React.ReactNode;
  /** 入场方向 */
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  /** 延迟（秒） */
  delay?: number;
  /** 持续时间（秒） */
  duration?: number;
  /** 移动距离（px） */
  distance?: number;
  className?: string;
  style?: React.CSSProperties;
}

const getInitialOffset = (direction: string, distance: number) => {
  switch (direction) {
    case 'up': return { x: 0, y: distance };
    case 'down': return { x: 0, y: -distance };
    case 'left': return { x: distance, y: 0 };
    case 'right': return { x: -distance, y: 0 };
    default: return { x: 0, y: 0 };
  }
};

const ScrollReveal: React.FC<ScrollRevealProps> = ({
  children,
  direction = 'up',
  delay = 0,
  duration,
  distance = 24,
  className,
  style,
}) => {
  // 减少动效偏好：直接渲染，无动画
  if (prefersReducedMotion()) {
    return <div className={className} style={style}>{children}</div>;
  }

  const isMobile = isMobileViewport();
  const actualDuration = duration ?? (isMobile ? 0.3 : 0.5);
  const actualDistance = isMobile ? Math.min(distance, 16) : distance;
  const offset = getInitialOffset(direction, actualDistance);

  const variants: Variants = {
    hidden: { opacity: 0, x: offset.x, y: offset.y },
    visible: { opacity: 1, x: 0, y: 0 },
  };

  const transition: Transition = {
    duration: actualDuration,
    delay,
    ease: [0.25, 0.1, 0.25, 1],
  };

  return (
    <motion.div
      className={className}
      style={style}
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.15, margin: '-60px' }}
      transition={transition}
    >
      {children}
    </motion.div>
  );
};

export default ScrollReveal;
