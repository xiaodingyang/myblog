import React, { useEffect, useState, useRef } from 'react';
import { useLocation } from 'umi';

const ReadingProgressBar: React.FC = () => {
  const { pathname } = useLocation();
  const [pct, setPct] = useState(0);
  const show = /^\/article\//.test(pathname);
  const rafRef = useRef(0);

  useEffect(() => {
    if (!show) return undefined;

    const onScroll = () => {
      if (rafRef.current) return;
      rafRef.current = requestAnimationFrame(() => {
        const el = document.documentElement;
        const scrollTop = el.scrollTop || document.body.scrollTop;
        const scrollHeight = el.scrollHeight - el.clientHeight;
        const p = scrollHeight > 0 ? Math.min(100, Math.max(0, (scrollTop / scrollHeight) * 100)) : 0;
        setPct(p);
        rafRef.current = 0;
      });
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [show, pathname]);

  if (!show) return null;

  const isComplete = pct >= 100;

  return (
    <>
      <style>{`
        @keyframes reading-pulse {
          0% { transform: scaleY(1); opacity: 1; }
          50% { transform: scaleY(1.8); opacity: 0.7; }
          100% { transform: scaleY(1); opacity: 1; }
        }
      `}</style>
      <div
        className="fixed left-0 right-0 z-[45] pointer-events-none"
        style={{ top: 64, height: 4 }}
      >
        <div className="w-full bg-black/10" style={{ height: 3, borderRadius: 2 }}>
          <div
            style={{
              width: `${pct}%`,
              height: 3,
              borderRadius: 2,
              background: 'linear-gradient(90deg, #ff4d4f 0%, #ff7a45 50%, #ffa940 100%)',
              boxShadow: '0 0 12px rgba(255, 122, 69, 0.5)',
              transition: 'width 80ms linear',
              animation: isComplete ? 'reading-pulse 0.6s ease-in-out' : 'none',
            }}
          />
        </div>
      </div>
    </>
  );
};

export default ReadingProgressBar;
