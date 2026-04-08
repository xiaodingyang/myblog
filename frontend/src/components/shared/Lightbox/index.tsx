import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Spin } from 'antd';
import { LeftOutlined, RightOutlined, CloseOutlined } from '@ant-design/icons';

interface LightboxProps {
  visible: boolean;
  images: string[];
  currentIndex: number;
  onClose: () => void;
  onIndexChange: (i: number) => void;
}

const Lightbox: React.FC<LightboxProps> = ({ visible, images, currentIndex, onClose, onIndexChange }) => {
  const [scale, setScale] = useState(1);
  const [loading, setLoading] = useState(true);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const touchRef = useRef<{ dist: number; x: number; y: number; sx: number; sy: number }>({ dist: 0, x: 0, y: 0, sx: 0, sy: 0 });

  // Reset on image change
  useEffect(() => {
    setScale(1);
    setLoading(true);
    setTranslate({ x: 0, y: 0 });
  }, [currentIndex, visible]);

  // Keyboard
  useEffect(() => {
    if (!visible) return;
    const handler = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape': onClose(); break;
        case 'ArrowLeft': if (currentIndex > 0) onIndexChange(currentIndex - 1); break;
        case 'ArrowRight': if (currentIndex < images.length - 1) onIndexChange(currentIndex + 1); break;
        case '+': case '=': setScale(s => Math.min(s + 0.25, 3)); break;
        case '-': setScale(s => Math.max(s - 0.25, 0.5)); break;
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [visible, currentIndex, images.length, onClose, onIndexChange]);

  // Mouse wheel zoom
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    setScale(s => {
      const next = s + (e.deltaY > 0 ? -0.15 : 0.15);
      return Math.max(0.5, Math.min(3, next));
    });
  }, []);

  // Touch pinch zoom
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      touchRef.current.dist = Math.hypot(dx, dy);
    } else if (e.touches.length === 1) {
      touchRef.current.x = e.touches[0].clientX;
      touchRef.current.y = e.touches[0].clientY;
      touchRef.current.sx = translate.x;
      touchRef.current.sy = translate.y;
    }
  }, [translate]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const newDist = Math.hypot(dx, dy);
      const ratio = newDist / touchRef.current.dist;
      setScale(s => Math.max(0.5, Math.min(3, s * ratio)));
      touchRef.current.dist = newDist;
    } else if (e.touches.length === 1 && scale > 1) {
      const dx = e.touches[0].clientX - touchRef.current.x;
      const dy = e.touches[0].clientY - touchRef.current.y;
      setTranslate({ x: touchRef.current.sx + dx, y: touchRef.current.sy + dy });
    }
  }, [scale]);

  if (!visible || images.length === 0) return null;

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,0.92)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'zoom-out',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      onWheel={handleWheel}
    >
      {/* Close */}
      <button
        onClick={onClose}
        style={{
          position: 'absolute', top: 16, right: 16, zIndex: 10002,
          background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%',
          width: 40, height: 40, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        <CloseOutlined style={{ color: '#fff', fontSize: 18 }} />
      </button>

      {/* Left arrow */}
      {currentIndex > 0 && (
        <button
          onClick={(e) => { e.stopPropagation(); onIndexChange(currentIndex - 1); }}
          style={{
            position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', zIndex: 10001,
            background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%',
            width: 44, height: 44, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <LeftOutlined style={{ color: '#fff', fontSize: 20 }} />
        </button>
      )}

      {/* Right arrow */}
      {currentIndex < images.length - 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); onIndexChange(currentIndex + 1); }}
          style={{
            position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', zIndex: 10001,
            background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%',
            width: 44, height: 44, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <RightOutlined style={{ color: '#fff', fontSize: 20 }} />
        </button>
      )}

      {/* Image */}
      <div
        style={{ maxWidth: '90vw', maxHeight: '90vh', position: 'relative' }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
      >
        {loading && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Spin size="large" />
          </div>
        )}
        <img
          src={images[currentIndex]}
          alt=""
          style={{
            maxWidth: '90vw', maxHeight: '85vh', objectFit: 'contain',
            transform: `scale(${scale}) translate(${translate.x / scale}px, ${translate.y / scale}px)`,
            transition: 'transform 0.15s ease',
            cursor: scale > 1 ? 'grab' : 'zoom-in',
            userSelect: 'none',
          }}
          draggable={false}
          onLoad={() => setLoading(false)}
          onClick={(e) => e.stopPropagation()}
        />
      </div>

      {/* Counter */}
      <div
        style={{
          position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)',
          color: 'rgba(255,255,255,0.7)', fontSize: 14, background: 'rgba(0,0,0,0.4)',
          padding: '4px 16px', borderRadius: 20,
        }}
      >
        {currentIndex + 1} / {images.length}
      </div>
    </div>
  );
};

export default Lightbox;
