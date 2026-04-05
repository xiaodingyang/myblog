import React from 'react';

interface OptimizedImageProps {
  src: string;
  webpSrc?: string;
  alt: string;
  thumbSrc?: string;
  thumbWebpSrc?: string;
  className?: string;
  style?: React.CSSProperties;
  loading?: 'lazy' | 'eager';
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src, webpSrc, alt, className, style, loading = 'lazy',
}) => (
  <picture>
    {webpSrc && <source srcSet={webpSrc} type="image/webp" />}
    <img src={src} alt={alt} loading={loading} className={className} style={style} />
  </picture>
);

export default OptimizedImage;
