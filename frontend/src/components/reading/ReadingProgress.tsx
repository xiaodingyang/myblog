import React, { useEffect, useState, useCallback, useRef } from 'react';

interface ReadingProgressProps {
  /** 进度条颜色 */
  color?: string;
  /** 进度条高度 */
  height?: number;
  /** 是否显示百分比文字 */
  showPercent?: boolean;
  /** 距离顶部的偏移量（px），用于计算阅读进度 */
  topOffset?: number;
}

/**
 * 文章阅读进度条
 * - 固定在页面顶部
 * - 根据滚动位置实时更新进度
 * - 到达底部时显示 100%
 */
const ReadingProgress: React.FC<ReadingProgressProps> = ({
  color,
  height = 3,
  showPercent = false,
  topOffset = 100,
}) => {
  const [progress, setProgress] = useState(0);
  const rafRef = useRef<number>(0);

  const calculateProgress = useCallback(() => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;

    if (docHeight <= 0) {
      setProgress(100);
      return;
    }

    // 考虑顶部偏移量，让进度从内容开始计算
    const adjustedScroll = Math.max(0, scrollTop - topOffset);
    const newProgress = Math.min(100, Math.round((adjustedScroll / docHeight) * 100));

    setProgress(newProgress);
  }, [topOffset]);

  useEffect(() => {
    const handleScroll = () => {
      if (rafRef.current) return;

      rafRef.current = requestAnimationFrame(() => {
        calculateProgress();
        rafRef.current = 0;
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    calculateProgress(); // 初始化

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [calculateProgress]);

  if (progress === 0) return null;

  const gradientColor = color || 'var(--ant-primary-color, #10b981)';

  return (
    <div
      className="reading-progress-container"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height,
        zIndex: 9999,
        backgroundColor: 'rgba(0, 0, 0, 0.08)',
        pointerEvents: 'none',
        backdropFilter: 'blur(4px)',
      }}
    >
      <div
        className="reading-progress-bar"
        style={{
          height: '100%',
          width: `${progress}%`,
          background: `linear-gradient(90deg, ${gradientColor}, ${gradientColor}dd, ${gradientColor})`,
          transition: 'width 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: `0 0 12px ${gradientColor}88, 0 0 24px ${gradientColor}44`,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* 添加流动光效 */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: '-100%',
            width: '100%',
            height: '100%',
            background: `linear-gradient(90deg, transparent, ${gradientColor}66, transparent)`,
            animation: 'shimmer 2s infinite',
          }}
        />
      </div>
      {showPercent && (
        <div
          style={{
            position: 'absolute',
            right: 8,
            top: '50%',
            transform: 'translateY(-50%)',
            fontSize: 10,
            fontWeight: 600,
            color: gradientColor,
            opacity: progress > 10 ? 1 : 0,
            transition: 'opacity 0.3s',
          }}
        >
          {progress}%
        </div>
      )}
    </div>
  );
};

export default ReadingProgress;
