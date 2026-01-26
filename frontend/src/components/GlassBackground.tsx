import React from 'react';
import { useModel } from 'umi';
import { getThemeById } from '@/config/particleThemes';
import { getColorThemeById } from '@/config/colorThemes';

interface GlassBackgroundProps {
  isDark?: boolean;
}

// 从主题色中提取 RGB 值
const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 255, g: 179, b: 217 };
};

// 调整颜色亮度
const adjustBrightness = (rgb: { r: number; g: number; b: number }, factor: number) => {
  return {
    r: Math.min(255, Math.round(rgb.r + (255 - rgb.r) * factor)),
    g: Math.min(255, Math.round(rgb.g + (255 - rgb.g) * factor)),
    b: Math.min(255, Math.round(rgb.b + (255 - rgb.b) * factor)),
  };
};

const GlassBackground: React.FC<GlassBackgroundProps> = ({ isDark = true }) => {
  const { themeId } = useModel('particleModel');
  const { themeId: colorThemeId } = useModel('colorModel');
  const currentTheme = getThemeById(themeId);
  const currentColorTheme = getColorThemeById(colorThemeId);

  const rgb = hexToRgb(currentColorTheme.primary);
  
  // 生成主题色的衍生色
  const lightTint = adjustBrightness(rgb, 0.92); // 非常淡的主题色
  const mediumTint = adjustBrightness(rgb, 0.85); // 稍深一点的主题色
  const softTint = adjustBrightness(rgb, 0.88); // 柔和的中间色

  return (
    <div
      className="fixed inset-0 pointer-events-none"
      style={{
        zIndex: 0,
        transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      {/* 基础背景层 - 主题色衍生的柔和渐变 */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            linear-gradient(
              135deg,
              rgb(${lightTint.r}, ${lightTint.g}, ${lightTint.b}) 0%,
              rgb(${softTint.r}, ${softTint.g}, ${softTint.b}) 25%,
              rgb(${lightTint.r}, ${lightTint.g}, ${lightTint.b}) 50%,
              rgb(${mediumTint.r}, ${mediumTint.g}, ${mediumTint.b}) 75%,
              rgb(${lightTint.r}, ${lightTint.g}, ${lightTint.b}) 100%
            )
          `,
        }}
      />

      {/* 主题色光晕 - 左上角 */}
      <div
        className="absolute"
        style={{
          top: '-10%',
          left: '-5%',
          width: '50%',
          height: '60%',
          background: `radial-gradient(ellipse at center, rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.15) 0%, transparent 70%)`,
          filter: 'blur(60px)',
        }}
      />

      {/* 主题色光晕 - 右下角 */}
      <div
        className="absolute"
        style={{
          bottom: '-15%',
          right: '-10%',
          width: '60%',
          height: '70%',
          background: `radial-gradient(ellipse at center, rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.12) 0%, transparent 70%)`,
          filter: 'blur(80px)',
        }}
      />

      {/* 白色高光层 - 增加通透感 */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 100% 80% at 50% 0%, rgba(255, 255, 255, 0.6) 0%, transparent 50%),
            radial-gradient(ellipse 80% 60% at 100% 50%, rgba(255, 255, 255, 0.3) 0%, transparent 50%)
          `,
        }}
      />

      {/* 中心柔和光晕 */}
      <div
        className="absolute"
        style={{
          top: '30%',
          left: '20%',
          width: '60%',
          height: '40%',
          background: `radial-gradient(ellipse at center, rgba(255, 255, 255, 0.4) 0%, transparent 60%)`,
          filter: 'blur(40px)',
        }}
      />

      {/* 底部渐变 - 增加层次感 */}
      <div
        className="absolute inset-x-0 bottom-0 h-1/3"
        style={{
          background: `linear-gradient(to top, rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.08) 0%, transparent 100%)`,
        }}
      />

      {/* 细腻的噪点纹理层 - 增加质感 */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          mixBlendMode: 'overlay',
        }}
      />
    </div>
  );
};

export default GlassBackground;
