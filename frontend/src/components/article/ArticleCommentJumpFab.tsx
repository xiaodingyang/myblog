import React, { useEffect, useState } from 'react';
import { useLocation } from 'umi';
import { Tooltip, message } from 'antd';
import { CommentOutlined } from '@ant-design/icons';
import { useModel } from 'umi';
import { getColorThemeById } from '@/config/colorThemes';
import { FAB_SIZE_PX } from '@/components/shared/floatingActionsConstants';

const SCROLL_HEADER_OFFSET_PX = 80;
const SECTION_ID = 'article-comments-section';

/**
 * 文章页「跳到评论区」：与右侧悬浮列同栈，避免与全站小苹果各算 bottom 造成大空隙或重叠。
 */
const ArticleCommentJumpFab: React.FC = () => {
  const { pathname } = useLocation();
  const { themeId } = useModel('colorModel');
  const theme = getColorThemeById(themeId);
  const [showCommentButton, setShowCommentButton] = useState(false);

  const isArticle = /^\/article\/[^/]+\/?$/.test(pathname);

  useEffect(() => {
    if (!isArticle) return;

    const handleScroll = () => {
      const el = document.getElementById(SECTION_ID);
      if (!el) return;
      const rect = el.getBoundingClientRect();
      setShowCommentButton(rect.top > window.innerHeight);
    };

    window.addEventListener('scroll', handleScroll, { passive: true, capture: true });
    window.addEventListener('resize', handleScroll, { passive: true });
    handleScroll();
    const t = window.setTimeout(handleScroll, 100);
    const raf = requestAnimationFrame(handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll, { capture: true });
      window.removeEventListener('resize', handleScroll);
      window.clearTimeout(t);
      cancelAnimationFrame(raf);
    };
  }, [isArticle, pathname]);

  if (!isArticle) return null;

  const scrollToComments = () => {
    const el = document.getElementById(SECTION_ID);
    if (!el) {
      message.warning('评论区尚未加载');
      return;
    }
    const top = el.getBoundingClientRect().top + window.scrollY - SCROLL_HEADER_OFFSET_PX;
    window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
  };

  return (
    <Tooltip
      title={
        showCommentButton
          ? '跳到评论区（平滑滚动）'
          : '跳到评论区（已在附近也可点击对齐）'
      }
      placement="left"
      mouseEnterDelay={0.2}
      getPopupContainer={() => document.body}
      zIndex={4000}
    >
      <button
        type="button"
        onClick={scrollToComments}
        className="rounded-xl shadow-lg transition-all duration-300 hover:scale-105"
        style={{
          position: 'relative',
          width: FAB_SIZE_PX,
          height: FAB_SIZE_PX,
          padding: 0,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          lineHeight: 0,
          flexShrink: 0,
          opacity: showCommentButton ? 1 : 0.45,
          transform: showCommentButton ? 'scale(1)' : 'scale(0.92)',
          pointerEvents: 'auto',
          transition: 'opacity 0.3s ease, transform 0.3s ease',
          background: theme.gradient,
          color: '#fff',
          border: 'none',
          boxShadow: `0 4px 14px ${theme.primary}55`,
          cursor: 'pointer',
        }}
        aria-label="跳到评论区"
      >
        <span className="inline-flex items-center justify-center" style={{ width: 22, height: 22 }}>
          <CommentOutlined style={{ fontSize: 20, lineHeight: 1 }} />
        </span>
      </button>
    </Tooltip>
  );
};

export default ArticleCommentJumpFab;
