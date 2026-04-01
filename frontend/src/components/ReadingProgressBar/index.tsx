import React, { useEffect, useState } from 'react';
import { useLocation } from 'umi';

const BAR_COLOR = '#ff4d4f';

const ReadingProgressBar: React.FC = () => {
  const { pathname } = useLocation();
  const [pct, setPct] = useState(0);
  const show = /^\/article\//.test(pathname);

  useEffect(() => {
    if (!show) return undefined;

    const onScroll = () => {
      const el = document.documentElement;
      const scrollTop = el.scrollTop || document.body.scrollTop;
      const scrollHeight = el.scrollHeight - el.clientHeight;
      const p = scrollHeight > 0 ? Math.min(100, Math.max(0, (scrollTop / scrollHeight) * 100)) : 0;
      setPct(p);
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [show, pathname]);

  if (!show) return null;

  return (
    <div
      className="fixed left-0 right-0 z-[45] pointer-events-none"
      style={{ top: 64, height: 4 }}
    >
      <div className="w-full bg-black/10" style={{ height: 3 }}>
        <div
          style={{
            width: `${pct}%`,
            height: 3,
            backgroundColor: BAR_COLOR,
            boxShadow: `0 0 12px ${BAR_COLOR}88`,
            transition: 'width 80ms linear',
          }}
        />
      </div>
    </div>
  );
};

export default ReadingProgressBar;
