import { useState, useEffect, useCallback } from 'react';

export function useLightbox(containerSelector: string, deps: any[] = []) {
  const [images, setImages] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visible, setVisible] = useState(false);

  const open = useCallback((index: number) => {
    setCurrentIndex(index);
    setVisible(true);
  }, []);

  const close = useCallback(() => {
    setVisible(false);
  }, []);

  useEffect(() => {
    // Small delay to ensure DOM is rendered
    const timer = setTimeout(() => {
      const container = document.querySelector(containerSelector);
      if (!container) return;

      const imgs = Array.from(container.querySelectorAll('img')) as HTMLImageElement[];
      const srcs = imgs.map(img => img.src).filter(Boolean);
      setImages(srcs);

      const handlers: Array<() => void> = [];
      imgs.forEach((img, i) => {
        img.style.cursor = 'zoom-in';
        const handler = (e: Event) => {
          e.preventDefault();
          e.stopPropagation();
          setCurrentIndex(i);
          setVisible(true);
        };
        img.addEventListener('click', handler);
        handlers.push(() => img.removeEventListener('click', handler));
      });

      return () => handlers.forEach(fn => fn());
    }, 300);

    return () => clearTimeout(timer);
  }, deps);

  return { images, currentIndex, visible, open, close, setCurrentIndex };
}
