import React, { useEffect, useState, useCallback } from 'react';
import { Button } from 'antd';
import { VerticalAlignTopOutlined } from '@ant-design/icons';

interface ScrollToTopProps {
  /** 滚动超过此阈值才显示按钮（默认 400px） */
  threshold?: number;
  /** 回到顶部按钮位置 */
  position?: { bottom?: number; right?: number };
  /** 回到顶部动画时长（ms） */
  duration?: number;
}

/**
 * 滚动到顶部按钮组件
 * - 自动监听滚动位置，超出阈值后淡入显示
 * - 点击后平滑滚动到顶部
 * - 支持键盘快捷键（Ctrl/Cmd + Home）
 */
const ScrollToTop: React.FC<ScrollToTopProps> = ({
  threshold = 400,
  position = { bottom: 100, right: 24 },
  duration = 300,
}) => {
  const [visible, setVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleScroll = useCallback(() => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    setVisible(scrollTop > threshold);
  }, [threshold]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // 初始化检查
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  // 键盘快捷键：Ctrl/Cmd + Home 回到顶部
  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Home') {
        e.preventDefault();
        scrollToTop();
      }
    };
    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, []);

  const scrollToTop = () => {
    if (isAnimating) return;
    setIsAnimating(true);

    const startPosition = window.scrollY;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // easeOutCubic 缓动函数
      const easeOut = 1 - Math.pow(1 - progress, 3);

      window.scrollTo(0, startPosition * (1 - easeOut));

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setIsAnimating(false);
      }
    };

    requestAnimationFrame(animate);
  };

  return (
    <Button
      type="primary"
      shape="circle"
      size="large"
      icon={<VerticalAlignTopOutlined />}
      onClick={scrollToTop}
      className="scroll-to-top-btn"
      aria-label="滚动到顶部"
      style={{
        position: 'fixed',
        bottom: position.bottom,
        right: position.right,
        zIndex: 100,
        opacity: visible ? 1 : 0,
        transform: visible ? 'scale(1)' : 'scale(0.8)',
        pointerEvents: visible ? 'auto' : 'none',
        transition: 'opacity 0.3s ease, transform 0.3s ease',
        boxShadow: '0 4px 14px rgba(0, 0, 0, 0.2)',
      }}
    />
  );
};

export default ScrollToTop;
