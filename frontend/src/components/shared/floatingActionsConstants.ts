/** 右侧悬浮按钮：统一尺寸与边距（单列栈见 FloatingActionsRail） */
export const FAB_SIZE_PX = 44;
/** 距视口右缘；悬浮列使用 `calc(FAB_RIGHT_PX + safe-area)` 避免贴边裁切 */
export const FAB_RIGHT_PX = 20;
export const FAB_GAP_PX = 12;
/** 距视口底边（快捷键在最下时的基准） */
export const FAB_KEYBOARD_BOTTOM_PX = 24;
/** 非 embedded 时「主题」与快捷键纵向错开 */
export const FAB_THEME_BOTTOM_PX = FAB_KEYBOARD_BOTTOM_PX + FAB_SIZE_PX + FAB_GAP_PX;
/** 非 embedded 时「回到顶部」与主题、快捷键纵向错开（仅独立 fixed 模式用） */
export const FAB_BACKTOP_BOTTOM_PX = FAB_THEME_BOTTOM_PX + FAB_SIZE_PX + FAB_GAP_PX;
/** 文章页 AI 助手展示名（弹窗标题、FAB 提示与无障碍） */
export const ARTICLE_AI_ASSISTANT_NAME = '小苹果🍎';
