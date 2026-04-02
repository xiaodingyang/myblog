import React, { useEffect, useState, useRef } from 'react';
import { UpOutlined } from '@ant-design/icons';

const BackToTop: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const rafRef = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      if (rafRef.current) return;
      rafRef.current = requestAnimationFrame(() => {
        setVisible(window.scrollY > 300);
        rafRef.current = 0;
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <button
      type="button"
      aria-label="回到顶部"
      onClick={scrollToTop}
      style={{
        position: 'fixed',
        bottom: 90,
        right: 24,
        zIndex: 99,
        width: 44,
        height: 44,
        borderRadius: '50%',
        border: 'none',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #ff4d4f 0%, #ff7a45 100%)',
        color: '#fff',
        fontSize: 18,
        boxShadow: '0 4px 16px rgba(255, 77, 79, 0.4)',
        opacity: visible ? 1 : 0,
        transform: visible ? 'scale(1)' : 'scale(0.6)',
        transition: 'opacity 0.3s ease, transform 0.3s ease',
        pointerEvents: visible ? 'auto' : 'none',
      }}
    >
      <UpOutlined />
    </button>
  );
};

export default BackToTop;
