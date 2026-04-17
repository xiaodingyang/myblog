import React from 'react';
import BackToTop from '@/components/layout/BackToTop';
import KeyboardHelpButton from '@/components/shared/KeyboardHelpButton';
import ParticleThemeSelector from '@/components/visual/ParticleThemeSelector';
import ArticleCommentJumpFab from '@/components/article/ArticleCommentJumpFab';
import { GlobalAppleFabButton } from '@/components/ai/GlobalAppleDock';
import {
  FAB_GAP_PX,
  FAB_KEYBOARD_BOTTOM_PX,
  FAB_RIGHT_PX,
} from '@/components/shared/floatingActionsConstants';

type Props = { isDarkTheme: boolean };

/**
 * 右侧悬浮单列：`flex-col-reverse` + 统一 gap，避免多个 `fixed` 各算 bottom 造成空隙/重叠与贴边裁切。
 */
const FloatingActionsRail: React.FC<Props> = ({ isDarkTheme }) => (
  <div
    className="fixed z-[60] flex flex-col-reverse items-center"
    style={{
      gap: FAB_GAP_PX,
      right: `calc(${FAB_RIGHT_PX}px + env(safe-area-inset-right, 0px))`,
      bottom: `calc(${FAB_KEYBOARD_BOTTOM_PX}px + env(safe-area-inset-bottom, 0px))`,
    }}
  >
    <KeyboardHelpButton embedded />
    <ParticleThemeSelector isDark={isDarkTheme} embedded />
    <ArticleCommentJumpFab />
    <GlobalAppleFabButton />
    {/* col-reverse：最后一项在最上方；置顶可能隐藏仍占位，放顶端避免中间「空一节」 */}
    <BackToTop embedded />
  </div>
);

export default FloatingActionsRail;
