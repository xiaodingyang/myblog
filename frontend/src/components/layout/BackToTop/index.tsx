import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useLocation } from 'umi';
import { UpOutlined } from '@ant-design/icons';
import {
  FAB_SIZE_PX,
  FAB_RIGHT_PX,
  FAB_BACKTOP_BOTTOM_PX,
} from '@/components/shared/floatingActionsConstants';

const FAB_RADIUS_PX = 12;

const BackToTop: React.FC<{ embedded?: boolean }> = ({ embedded }) => {
  const { pathname } = useLocation();
  const [visible, setVisible] = useState(false);
  const rafRef = useRef(0);

  const updateVisible = useCallback(() => {
    const homeScroll = document.querySelector('.home-fullscreen-scroll') as HTMLElement | null;
    const y = homeScroll ? homeScroll.scrollTop : window.scrollY;
    setVisible(y > 300);
  }, []);

  useEffect(() => {
    const onScroll = () => {
      if (rafRef.current) return;
      rafRef.current = requestAnimationFrame(() => {
        updateVisible();
        rafRef.current = 0;
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true, capture: true });
    const homeScroll = document.querySelector('.home-fullscreen-scroll');
    homeScroll?.addEventListener('scroll', onScroll, { passive: true });
    updateVisible();

    return () => {
      window.removeEventListener('scroll', onScroll, { capture: true });
      homeScroll?.removeEventListener('scroll', onScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [updateVisible, pathname]);

  const scrollToTop = () => {
    const homeScroll = document.querySelector('.home-fullscreen-scroll') as HTMLElement | null;
    if (homeScroll) {
      homeScroll.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <button
      type="button"
      aria-label="回到顶部"
      onClick={scrollToTop}
      style={{
        position: embedded ? 'relative' : 'fixed',
        ...(embedded
          ? {}
          : {
              bottom: FAB_BACKTOP_BOTTOM_PX,
              right: FAB_RIGHT_PX,
              zIndex: 99,
            }),
        width: FAB_SIZE_PX,
        height: FAB_SIZE_PX,
        borderRadius: FAB_RADIUS_PX,
        border: 'none',
        cursor: 'pointer',
        padding: 0,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        lineHeight: 0,
        flexShrink: 0,
        background: 'linear-gradient(135deg, #ff4d4f 0%, #ff7a45 100%)',
        color: '#fff',
        boxShadow: '0 4px 16px rgba(255, 77, 79, 0.4)',
        opacity: visible ? 1 : 0,
        transform: visible ? 'scale(1)' : 'scale(0.6)',
        transition: 'opacity 0.3s ease, transform 0.3s ease',
        pointerEvents: visible ? 'auto' : 'none',
      }}
    >
      <span
        className="inline-flex items-center justify-center"
        style={{ width: 22, height: 22 }}
      >
        <UpOutlined style={{ fontSize: 20, lineHeight: 1 }} />
      </span>
    </button>
  );
};

export default BackToTop;
