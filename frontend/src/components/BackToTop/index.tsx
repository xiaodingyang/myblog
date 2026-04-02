import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useLocation } from 'umi';
import { UpOutlined } from '@ant-design/icons';
import {
  FAB_SIZE_PX,
  FAB_RIGHT_PX,
  FAB_BACKTOP_BOTTOM_PX,
} from '@/components/floatingActionsConstants';

const BackToTop: React.FC = () => {
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
        position: 'fixed',
        bottom: FAB_BACKTOP_BOTTOM_PX,
        right: FAB_RIGHT_PX,
        zIndex: 99,
        width: FAB_SIZE_PX,
        height: FAB_SIZE_PX,
        borderRadius: FAB_SIZE_PX / 2,
        border: 'none',
        cursor: 'pointer',
        padding: 0,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        lineHeight: 0,
        background: 'linear-gradient(135deg, #ff4d4f 0%, #ff7a45 100%)',
        color: '#fff',
        boxShadow: '0 4px 16px rgba(255, 77, 79, 0.4)',
        opacity: visible ? 1 : 0,
        transform: visible ? 'scale(1)' : 'scale(0.6)',
        transition: 'opacity 0.3s ease, transform 0.3s ease',
        pointerEvents: visible ? 'auto' : 'none',
      }}
    >
      <UpOutlined style={{ fontSize: 18, lineHeight: 1, display: 'flex' }} />
    </button>
  );
};

export default BackToTop;
