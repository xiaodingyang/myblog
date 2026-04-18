import React, { lazy, Suspense, useEffect, useState } from 'react';
import { Tooltip } from 'antd';
import { RobotOutlined } from '@ant-design/icons';
import { useModel } from 'umi';
import { getColorThemeById } from '@/config/colorThemes';
import {
  ARTICLE_AI_ASSISTANT_NAME,
  FAB_SIZE_PX,
} from '@/components/shared/floatingActionsConstants';
import { useAiApple } from '@/contexts/AiAppleContext';

const LazyArticleAiAssistantModal = lazy(() => import('@/components/article/ArticleAiAssistantModal'));

const PULSE_STORAGE_KEY = 'blog_ai_apple_fab_hint_v1';

/** 悬浮列内的小苹果按钮（与 {@link GlobalAppleDock} 弹窗配套） */
export function GlobalAppleFabButton() {
  const { themeId } = useModel('colorModel');
  const theme = getColorThemeById(themeId);
  const { openAssistant } = useAiApple();
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(PULSE_STORAGE_KEY)) {
        setPulse(true);
        const t = window.setTimeout(() => {
          setPulse(false);
          try {
            localStorage.setItem(PULSE_STORAGE_KEY, '1');
          } catch {
            /* ignore */
          }
        }, 6000);
        return () => clearTimeout(t);
      }
    } catch {
      setPulse(false);
    }
    return undefined;
  }, []);

  return (
    <Tooltip
      title={`${ARTICLE_AI_ASSISTANT_NAME}：全站可问，文章页自动带上本篇`}
      placement="left"
      mouseEnterDelay={0.15}
      open={pulse ? true : undefined}
      getPopupContainer={() => document.body}
      zIndex={4000}
    >
      <button
        type="button"
        onClick={() => openAssistant()}
        className={`rounded-card-lg shadow-lg transition-all duration-300 hover:scale-105 ${pulse ? 'animate-pulse' : ''}`}
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
          background: theme.gradient,
          color: '#fff',
          border: 'none',
          boxShadow: `0 4px 18px ${theme.primary}55`,
          cursor: 'pointer',
        }}
        aria-label={`打开 ${ARTICLE_AI_ASSISTANT_NAME}`}
      >
        <RobotOutlined style={{ fontSize: 20, lineHeight: 1 }} />
      </button>
    </Tooltip>
  );
}

/**
 * 全站小苹果弹窗（按钮在 {@link FloatingActionsRail} 内，保证与其它 FAB 同列对齐）
 */
const GlobalAppleDock: React.FC = () => {
  const { githubToken } = useModel('githubUserModel');
  const { open, ctx, closeAssistant } = useAiApple();

  return (
    <Suspense fallback={null}>
      <LazyArticleAiAssistantModal
        open={open}
        onClose={closeAssistant}
        articleId={ctx.id}
        articleTitle={ctx.title}
        githubToken={githubToken}
      />
    </Suspense>
  );
};

export default GlobalAppleDock;
