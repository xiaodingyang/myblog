import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { prefersReducedMotion, isMobileViewport } from '@/utils/motionPrefs';

interface OptimizedImageProps {
  src: string;
  webpSrc?: string;
  alt: string;
  thumbSrc?: string;
  thumbWebpSrc?: string;
  className?: string;
  style?: React.CSSProperties;
  loading?: 'lazy' | 'eager';
  /** 加载揭示动画类型 */
  revealAnimation?: 'blur' | 'fade' | 'none';
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src, webpSrc, alt, className, style, loading = 'lazy',
  revealAnimation,
}) => {
  const [loaded, setLoaded] = useState(false);
  const reducedMotion = prefersReducedMotion();

  // 决定动画类型
  const animType = revealAnimation ?? (reducedMotion || isMobileViewport() ? 'fade' : 'blur');

  if (animType === 'none' || reducedMotion) {
    return (
      <picture>
        {webpSrc && <source srcSet={webpSrc} type="image/webp" />}
        <img src={src} alt={alt} loading={loading} className={className} style={style} />
      </picture>
    );
  }

  return (
    <motion.div
      className={className}
      style={{ ...style, overflow: 'hidden' }}
      initial={animType === 'blur' ? { opacity: 0, filter: 'blur(20px)' } : { opacity: 0 }}
      animate={loaded ? { opacity: 1, filter: 'blur(0px)' } : undefined}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <picture>
        {webpSrc && <source srcSet={webpSrc} type="image/webp" />}
        <img
          src={src}
          alt={alt}
          loading={loading}
          onLoad={() => setLoaded(true)}
          style={{ width: '100%', height: '100%', objectFit: (style?.objectFit as any) || 'cover' }}
        />
      </picture>
    </motion.div>
  );
};

export default OptimizedImage;
