import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useLocation } from 'umi';
import { Tooltip } from 'antd';
import { UpOutlined } from '@ant-design/icons';
import {
  FAB_SIZE_PX,
  FAB_RIGHT_PX,
  FAB_BACKTOP_BOTTOM_PX,
} from '@/components/shared/floatingActionsConstants';

const FAB_RADIUS_PX = 12;

/**
 * ScrollToTop 返回顶部按钮组件
 * 
 * 功能特性：
 * 1. 滚动超过 300px 时显示按钮
 * 2. 点击按钮平滑滚动到页面顶部
 * 3. 使用 Tailwind CSS 样式
 * 4. 支持首页特殊滚动容器
 * 5. 使用 requestAnimationFrame 优化性能
 * 
 * @param embedded - 是否嵌入到悬浮按钮容器中（使用相对定位）
 */
const BackToTop: React.FC<{ embedded?: boolean }> = ({ embedded }) => {
  const { pathname } = useLocation();
  const [visible, setVisible] = useState(false);
  const rafRef = useRef(0);

  // 更新按钮可见性：滚动超过 300px 时显示
  const updateVisible = useCallback(() => {
    const homeScroll = document.querySelector('.home-fullscreen-scroll') as HTMLElement | null;
    const y = homeScroll ? homeScroll.scrollTop : window.scrollY;
    setVisible(y > 300);
  }, []);

  // 监听滚动事件，使用 RAF 节流优化性能
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

  // 平滑滚动到顶部
  const scrollToTop = () => {
    const homeScroll = document.querySelector('.home-fullscreen-scroll') as HTMLElement | null;
    if (homeScroll) {
      homeScroll.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const btn = (
    <button
      type="button"
      aria-label="回到顶部"
      onClick={scrollToTop}
      className={`
        inline-flex items-center justify-center
        border-0 cursor-pointer p-0 flex-shrink-0
        bg-gradient-to-br from-red-500 to-orange-500
        text-white
        shadow-lg shadow-red-500/40
        transition-all duration-300 ease-in-out
        hover:shadow-xl hover:shadow-red-500/50 hover:scale-105
        active:scale-95
        ${visible ? 'opacity-100 scale-100' : 'opacity-0 scale-60 pointer-events-none'}
        ${embedded ? 'relative' : 'fixed z-[99]'}
      `}
      style={{
        ...(!embedded && {
          bottom: FAB_BACKTOP_BOTTOM_PX,
          right: FAB_RIGHT_PX,
        }),
        width: FAB_SIZE_PX,
        height: FAB_SIZE_PX,
        borderRadius: FAB_RADIUS_PX,
      }}
    >
      <span className="inline-flex items-center justify-center w-[22px] h-[22px]">
        <UpOutlined className="text-[20px] leading-none" />
      </span>
    </button>
  );

  return (
    <Tooltip title="回到顶部" placement="left" mouseEnterDelay={0.35}>
      {btn}
    </Tooltip>
  );
};

export default BackToTop;
