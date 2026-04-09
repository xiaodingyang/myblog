import { useRef, useCallback, useState, useEffect } from 'react';
import { isTouchDevice } from '@/utils/motionPrefs';

interface UseTiltOptions {
  maxTilt?: number;
  scale?: number;
  perspective?: number;
  speed?: number;
}

interface TiltHandlers {
  onMouseEnter: () => void;
  onMouseMove: (e: React.MouseEvent<HTMLElement>) => void;
  onMouseLeave: () => void;
}

export function useTilt(options: UseTiltOptions = {}) {
  const { maxTilt = 6, scale = 1.02, perspective = 800, speed = 400 } = options;
  const ref = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState<React.CSSProperties>({
    transformStyle: 'preserve-3d',
    willChange: 'transform',
  });
  const [isTouch] = useState(() => isTouchDevice());

  const reset = useCallback(() => {
    setStyle((prev) => ({
      ...prev,
      transform: 'rotateX(0deg) rotateY(0deg) scale(1)',
      transition: `transform ${speed}ms cubic-bezier(0.25, 0.1, 0.25, 1)`,
    }));
  }, [speed]);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      if (isTouch || !ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -maxTilt;
      const rotateY = ((x - centerX) / centerX) * maxTilt;

      setStyle((prev) => ({
        ...prev,
        transform: `perspective(${perspective}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${scale})`,
        transition: `transform ${speed * 0.6}ms cubic-bezier(0.25, 0.1, 0.25, 1)`,
      }));
    },
    [isTouch, maxTilt, scale, perspective, speed],
  );

  const handleMouseEnter = useCallback(() => {
    if (isTouch) return;
    setStyle((prev) => ({
      ...prev,
      transition: 'none',
    }));
  }, [isTouch]);

  const handlers: TiltHandlers = isTouch
    ? { onMouseEnter: () => {}, onMouseMove: () => {}, onMouseLeave: () => {} }
    : { onMouseEnter: handleMouseEnter, onMouseMove: handleMouseMove, onMouseLeave: reset };

  return { ref, handlers, style };
}
