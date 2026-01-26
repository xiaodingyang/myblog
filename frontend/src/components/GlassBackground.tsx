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
    : { r: 255, g: 179, b: 217 }; // 默认粉色
};

const GlassBackground: React.FC<GlassBackgroundProps> = ({ isDark = true }) => {
  const { themeId } = useModel('particleModel');
  const { themeId: colorThemeId } = useModel('colorModel');
  const currentTheme = getThemeById(themeId);
  const currentColorTheme = getColorThemeById(colorThemeId);

  // 根据主题色和粒子主题生成玉石质感的毛玻璃背景
  const getGlassBackground = () => {
    const rgb = hexToRgb(currentColorTheme.primary);
    
    // 获取粒子主题的背景渐变或颜色作为基础背景
    const baseBackground = currentTheme.backgroundGradient || currentTheme.backgroundColor || 
      (isDark ? 'linear-gradient(180deg, #0f172a 0%, #1e293b 50%, #334155 100%)' : '#ffffff');
    
    // 玉石质感：更温润的白色，带有微妙的光泽 - 进一步降低透明度让粒子清晰可见
    const jadeWhiteOpacity = isDark ? 0.12 : 0.18; // 玉石白色层 - 进一步降低透明度
    const jadeTintOpacity = isDark ? 0.04 : 0.06; // 主题色温润点缀
    const borderOpacity = isDark ? 0.1 : 0.08;

    // 创建玉石质感的毛玻璃背景
    // 模拟玉石的温润、半透明、有光泽的质感
    // 使用白色作为主要背景色，覆盖原有的深色背景
    return {
      background: `
        radial-gradient(ellipse at top, 
          rgba(255, 255, 255, ${jadeWhiteOpacity * 1.2}) 0%, 
          rgba(255, 255, 255, ${jadeWhiteOpacity}) 40%,
          rgba(255, 255, 255, ${jadeWhiteOpacity * 0.7}) 100%
        ),
        linear-gradient(135deg, 
          rgba(255, 255, 255, ${jadeWhiteOpacity * 0.8}) 0%, 
          rgba(255, 255, 255, ${jadeWhiteOpacity * 0.6}) 100%
        ),
        linear-gradient(135deg, 
          rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${jadeTintOpacity}) 0%, 
          rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${jadeTintOpacity * 0.3}) 100%
        )
      `,
      backdropFilter: 'blur(20px) saturate(150%) brightness(1.05)',
      WebkitBackdropFilter: 'blur(20px) saturate(150%) brightness(1.05)',
      border: `1px solid rgba(255, 255, 255, ${borderOpacity})`,
      boxShadow: `
        0 8px 32px 0 rgba(0, 0, 0, ${isDark ? 0.15 : 0.08}),
        inset 0 1px 2px 0 rgba(255, 255, 255, ${isDark ? 0.1 : 0.2}),
        inset 0 -1px 1px 0 rgba(0, 0, 0, ${isDark ? 0.08 : 0.04})
      `,
    };
  };

  return (
    <div
      className="fixed inset-0 pointer-events-none"
      style={{
        ...getGlassBackground(),
        zIndex: 0.5, // 在粒子背景之下，作为背景层
        transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      {/* 添加玉石质感的光泽和温润效果 */}
      {(() => {
        const rgb = hexToRgb(currentColorTheme.primary);
        return (
          <>
            {/* 玉石光泽层 - 模拟玉石的内部光泽 - 降低透明度让粒子可见 */}
            <div
              className="absolute inset-0"
              style={{
                background: `
                  radial-gradient(ellipse 80% 50% at 30% 20%, rgba(255, 255, 255, 0.15) 0%, transparent 60%),
                  radial-gradient(ellipse 60% 40% at 70% 80%, rgba(255, 255, 255, 0.12) 0%, transparent 60%),
                  radial-gradient(ellipse 100% 60% at 50% 50%, rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.08) 0%, transparent 70%)
                `,
                mixBlendMode: isDark ? 'screen' : 'overlay',
                opacity: 0.6,
              }}
            />
            {/* 玉石纹理层 - 模拟玉石的细腻纹理 */}
            <div
              className="absolute inset-0"
              style={{
                background: `
                  repeating-linear-gradient(
                    0deg,
                    transparent,
                    transparent 2px,
                    rgba(255, 255, 255, 0.02) 2px,
                    rgba(255, 255, 255, 0.02) 4px
                  ),
                  repeating-linear-gradient(
                    90deg,
                    transparent,
                    transparent 2px,
                    rgba(255, 255, 255, 0.02) 2px,
                    rgba(255, 255, 255, 0.02) 4px
                  )
                `,
                opacity: 0.4,
                mixBlendMode: 'overlay',
              }}
            />
          </>
        );
      })()}
    </div>
  );
};

export default GlassBackground;
