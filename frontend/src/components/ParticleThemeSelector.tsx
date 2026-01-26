import React, { useState } from 'react';
import { Tooltip, Drawer, Divider } from 'antd';
import { SettingOutlined, BgColorsOutlined } from '@ant-design/icons';
import { particleThemes, getThemeById } from '@/config/particleThemes';
import { colorThemes, getColorThemeById } from '@/config/colorThemes';
import { useModel } from 'umi';

interface ParticleThemeSelectorProps {
  isDark?: boolean;
}

const ParticleThemeSelector: React.FC<ParticleThemeSelectorProps> = ({ isDark = false }) => {
  const [open, setOpen] = useState(false);
  const { themeId, changeTheme } = useModel('particleModel');
  const { themeId: colorThemeId, changeTheme: changeColorTheme } = useModel('colorModel');
  const currentTheme = getThemeById(themeId);
  const currentColorTheme = getColorThemeById(colorThemeId);

  return (
    <>
      {/* 悬浮触发按钮 - 毛玻璃风格 */}
      <Tooltip title="主题设置" placement="left">
        <button
          onClick={() => setOpen(true)}
          className="fixed right-4 bottom-20 z-50 w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-105 hover:-translate-y-0.5 group"
          style={{
            background: 'rgba(255, 255, 255, 0.7)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: `1px solid rgba(255, 255, 255, 0.5)`,
            boxShadow: `0 4px 20px rgba(0, 0, 0, 0.08), 0 0 0 1px ${currentColorTheme.primary}20`,
            cursor: 'pointer',
          }}
        >
          <span 
            className="text-lg transition-transform duration-300 group-hover:rotate-12"
            style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))' }}
          >
            {currentTheme.icon}
          </span>
        </button>
      </Tooltip>

      {/* 主题选择抽屉 */}
      <Drawer
        title={
          <div className="flex items-center gap-2">
            <SettingOutlined />
            <span>主题设置</span>
          </div>
        }
        placement="right"
        width={320}
        open={open}
        onClose={() => setOpen(false)}
        styles={{
          body: { padding: 16 },
        }}
      >
        {/* 粒子主题选择 */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <SettingOutlined />
            <span className="font-semibold text-base">粒子主题</span>
          </div>
          <div className="space-y-3">
            {particleThemes.map((theme) => {
              const isActive = theme.id === themeId;
              return (
                <div
                  key={theme.id}
                  onClick={() => {
                    changeTheme(theme.id);
                  }}
                  className={`
                    p-4 rounded-xl cursor-pointer transition-all duration-300
                    ${isActive 
                      ? 'border-2' 
                      : 'bg-gray-50 border-2 border-transparent hover:border-gray-200'
                    }
                  `}
                  style={isActive ? {
                    background: `linear-gradient(to right, ${currentColorTheme.primary}1a, ${currentColorTheme.primary}26)`,
                    borderColor: currentColorTheme.primary,
                  } : {}}
                >
                  <div className="flex items-center gap-3">
                  <div
                    className={`
                      w-12 h-12 rounded-xl flex items-center justify-center text-2xl
                      ${isActive ? '' : 'bg-gray-200'}
                    `}
                    style={isActive ? {
                      background: currentColorTheme.gradient,
                    } : {}}
                  >
                    {theme.icon}
                  </div>
                  <div className="flex-1">
                    <div 
                      className={`font-semibold ${isActive ? '' : 'text-gray-800'}`}
                      style={isActive ? { color: currentColorTheme.primary } : {}}
                    >
                      {theme.name}
                    </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {theme.description}
                      </div>
                    </div>
                  {isActive && (
                    <div 
                      className="w-6 h-6 rounded-full flex items-center justify-center"
                      style={{ background: currentColorTheme.primary }}
                    >
                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <Divider />

        {/* 颜色主题选择 */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <BgColorsOutlined />
            <span className="font-semibold text-base">主题色</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {colorThemes.map((colorTheme) => {
              const isActive = colorTheme.id === colorThemeId;
              return (
                <div
                  key={colorTheme.id}
                  onClick={() => {
                    changeColorTheme(colorTheme.id);
                  }}
                  className={`
                    relative p-4 rounded-xl cursor-pointer transition-all duration-300
                    ${isActive ? '' : 'hover:ring-1 hover:ring-gray-300'}
                  `}
                  style={{
                    background: colorTheme.gradient,
                    ...(isActive ? {
                      border: `2px solid ${colorTheme.primary}`,
                      boxShadow: `0 0 0 2px ${colorTheme.primary}40`,
                    } : {
                      border: '2px solid transparent',
                    }),
                  }}
                >
                  <div className="text-white font-semibold text-sm mb-1">
                    {colorTheme.name}
                  </div>
                  <div className="text-white/80 text-xs">
                    {colorTheme.description}
                  </div>
                  {isActive && (
                    <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-white flex items-center justify-center">
                      <svg className="w-3 h-3" style={{ color: colorTheme.primary }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 提示文字 */}
        <div className="mt-6 p-4 bg-gray-50 rounded-xl">
          <p className="text-sm text-gray-500 leading-relaxed">
            💡 <strong>提示：</strong>选择的主题会自动保存，下次访问时会记住您的选择。
          </p>
        </div>
      </Drawer>
    </>
  );
};

export default ParticleThemeSelector;
