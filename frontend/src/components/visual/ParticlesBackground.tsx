import React from 'react';
import { ParticlesBackground as RPB } from '@xdy-npm/react-particle-backgrounds';
import { useModel } from 'umi';
import { getColorThemeById } from '@/config/colorThemes';

interface ParticlesBackgroundProps {
  isDark?: boolean;
}

// Three.js 主题列表
const THREE_JS_THEMES = ['wave', 'wave2d', 'tyndall'];

// 将颜色变暗
const darkenColor = (hex: string, factor: number) => {
  const match = hex.replace('#', '');
  const r = Math.round(parseInt(match.substring(0, 2), 16) * factor);
  const g = Math.round(parseInt(match.substring(2, 4), 16) * factor);
  const b = Math.round(parseInt(match.substring(4, 6), 16) * factor);
  return { r, g, b };
};

// 生成带主题色衍生的深色玻璃态背景
const generateThemeDarkBackground = (primaryColor: string) => {
  const hex = primaryColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  // 生成主题色的深色衍生
  const dark1 = darkenColor(primaryColor, 0.12); // 很暗的主题色
  const dark2 = darkenColor(primaryColor, 0.08); // 更暗
  const dark3 = darkenColor(primaryColor, 0.18); // 稍亮一点的暗色

  return `
    /* 主题色光晕 - 左上角 */
    radial-gradient(ellipse 45% 50% at 5% 5%, rgba(${r}, ${g}, ${b}, 0.35) 0%, transparent 60%),
    /* 主题色光晕 - 右下角 */
    radial-gradient(ellipse 55% 60% at 95% 95%, rgba(${r}, ${g}, ${b}, 0.25) 0%, transparent 55%),
    /* 中间柔和光晕 */
    radial-gradient(ellipse 40% 35% at 80% 30%, rgba(${r}, ${g}, ${b}, 0.12) 0%, transparent 60%),
    /* 深色主题色渐变背景 */
    linear-gradient(
      135deg,
      rgba(${dark1.r}, ${dark1.g}, ${dark1.b}, 0.88) 0%,
      rgba(${dark2.r}, ${dark2.g}, ${dark2.b}, 0.85) 35%,
      rgba(${dark3.r}, ${dark3.g}, ${dark3.b}, 0.82) 65%,
      rgba(${dark1.r}, ${dark1.g}, ${dark1.b}, 0.90) 100%
    )
  `;
};

const ParticlesBackground: React.FC<ParticlesBackgroundProps> = ({ isDark = true }) => {
  const { themeId } = useModel('particleModel');
  const { themeId: colorThemeId } = useModel('colorModel');
  const themeColor = getColorThemeById(colorThemeId).primary;

  const isThreeJsTheme = THREE_JS_THEMES.includes(themeId);
  const darkBackground = generateThemeDarkBackground(themeColor);

  // 丁达尔主题保留原背景
  if (themeId === 'tyndall') {
    return (
      <RPB theme={themeId} isDark={isDark} themeColor={themeColor} />
    );
  }

  // Three.js 主题（波浪等）：通过 style 设置背景
  if (isThreeJsTheme) {
    return (
      <RPB
        theme={themeId}
        isDark={isDark}
        themeColor={themeColor}
        style={{ background: darkBackground }}
      />
    );
  }

  // tsparticles 主题：渲染独立的背景层
  return (
    <>
      {/* 深色玻璃态背景层 */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 0,
          pointerEvents: 'none',
          background: darkBackground,
        }}
      />
      {/* 粒子层 */}
      <RPB theme={themeId} isDark={isDark} themeColor={undefined} />
    </>
  );
};

export default ParticlesBackground;
