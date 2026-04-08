import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { prefersReducedMotion } from '@/utils/motionPrefs';

interface Ripple {
  id: number;
  x: number;
  y: number;
  size: number;
}

interface MotionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  /** 是否启用涟漪效果 */
  ripple?: boolean;
  /** 按下缩放比例 */
  tapScale?: number;
  /** 悬浮缩放比例 */
  hoverScale?: number;
}

const MotionButton: React.FC<MotionButtonProps> = ({
  children,
  ripple = true,
  tapScale = 0.96,
  hoverScale = 1.03,
  onClick,
  className,
  style,
  ...rest
}) => {
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const reducedMotion = prefersReducedMotion();

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      if (ripple && !reducedMotion) {
        const rect = e.currentTarget.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height) * 2;
        const rippleItem: Ripple = {
          id: Date.now(),
          x: e.clientX - rect.left - size / 2,
          y: e.clientY - rect.top - size / 2,
          size,
        };
        setRipples((prev) => [...prev, rippleItem]);
        setTimeout(() => {
          setRipples((prev) => prev.filter((r) => r.id !== rippleItem.id));
        }, 600);
      }
      onClick?.(e);
    },
    [onClick, ripple, reducedMotion],
  );

  if (reducedMotion) {
    return (
      <button className={className} style={style} onClick={onClick} {...rest}>
        {children}
      </button>
    );
  }

  return (
    <motion.button
      className={className}
      style={{ ...style, position: 'relative', overflow: 'hidden' }}
      whileHover={{ scale: hoverScale }}
      whileTap={{ scale: tapScale }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      onClick={handleClick}
      {...(rest as any)}
    >
      <span style={{ position: 'relative', zIndex: 1 }}>{children}</span>
      <AnimatePresence>
        {ripples.map((r) => (
          <motion.span
            key={r.id}
            initial={{ opacity: 0.35, scale: 0 }}
            animate={{ opacity: 0, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            style={{
              position: 'absolute',
              top: r.y,
              left: r.x,
              width: r.size,
              height: r.size,
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.4)',
              pointerEvents: 'none',
            }}
          />
        ))}
      </AnimatePresence>
    </motion.button>
  );
};

export default MotionButton;
