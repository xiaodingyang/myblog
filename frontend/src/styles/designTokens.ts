/**
 * 设计规范常量
 * 统一管理圆角、间距、字体大小、阴影等设计 token
 */

// 圆角规范
export const BORDER_RADIUS = {
  // 卡片圆角
  CARD_LARGE: '8px',       // 大卡片（主要内容区）12px → 8px
  CARD_MEDIUM: '6px',      // 中等卡片 10px → 6px
  CARD_SMALL: '4px',       // 小卡片、图标容器 8px → 4px

  // 交互元素圆角
  BUTTON: '4px',           // 按钮 8px → 4px
  BUTTON_PILL: '9999px',   // 胶囊按钮
  TAG: '3px',              // 标签 6px → 3px
  INPUT: '4px',            // 输入框 8px → 4px

  // 特殊元素
  AVATAR: '50%',           // 头像（圆形）
  BADGE: '2px',            // 徽章 4px → 2px
} as const;

// 间距规范
export const SPACING = {
  // 区块间距
  SECTION: '40px',         // 大区块间距
  BLOCK: '24px',           // 中等区块间距
  CARD: '16px',            // 卡片间距

  // 内边距
  CARD_PADDING_LARGE: '24px',   // 大卡片内边距
  CARD_PADDING_MEDIUM: '20px',  // 中等卡片内边距
  CARD_PADDING_SMALL: '16px',   // 小卡片内边距
  CTA_PADDING: '24px 32px',     // CTA 区域内边距

  // 元素间距
  ELEMENT_LARGE: '16px',   // 大元素间距
  ELEMENT_MEDIUM: '12px',  // 中等元素间距
  ELEMENT_SMALL: '8px',    // 小元素间距
  ELEMENT_TINY: '4px',     // 微小间距
} as const;

// 字体大小规范
export const FONT_SIZE = {
  // 标题
  TITLE_LARGE: '24px',     // 大标题
  TITLE_MEDIUM: '18px',    // 中标题
  TITLE_SMALL: '16px',     // 小标题
  HEADING_SMALL: '14px',   // 小标题（卡片标题）

  // 正文
  BODY_LARGE: '14px',      // 大正文
  BODY_MEDIUM: '13px',     // 中正文
  BODY_SMALL: '12px',      // 小正文

  // 辅助文字
  CAPTION: '11px',         // 说明文字
  TAG: '10px',             // 标签文字
  TINY: '10px',            // 微小文字

  // 图标
  ICON_MEDIUM: '16px',     // 中等图标
  ICON_SMALL: '14px',      // 小图标
} as const;

// 阴影规范
export const BOX_SHADOW = {
  // 基础阴影
  NONE: 'none',
  SMALL: '0 2px 8px rgba(0, 0, 0, 0.1)',
  MEDIUM: '0 4px 16px rgba(0, 0, 0, 0.15)',
  LARGE: '0 8px 32px rgba(0, 0, 0, 0.2)',

  // 特殊阴影
  CARD_HOVER: '0 4px 16px rgba(0, 0, 0, 0.15)',
  BUTTON_HOVER: '0 4px 12px rgba(0, 0, 0, 0.2)',
} as const;

// 过渡动画规范
export const TRANSITION = {
  FAST: '150ms',
  NORMAL: '300ms',
  SLOW: '500ms',

  // 常用过渡
  ALL: 'all 300ms ease',
  TRANSFORM: 'transform 300ms ease',
  OPACITY: 'opacity 300ms ease',
  SHADOW: 'box-shadow 300ms ease',
} as const;

// 响应式断点
export const BREAKPOINTS = {
  MOBILE: '640px',
  TABLET: '768px',
  DESKTOP: '1024px',
  WIDE: '1280px',
} as const;

// 导出所有设计 token
export const DESIGN_TOKENS = {
  borderRadius: BORDER_RADIUS,
  spacing: SPACING,
  fontSize: FONT_SIZE,
  boxShadow: BOX_SHADOW,
  transition: TRANSITION,
  breakpoints: BREAKPOINTS,
} as const;

export default DESIGN_TOKENS;
