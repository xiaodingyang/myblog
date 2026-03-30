import React from 'react';
import { ParticlesBackground as RPB } from '@xdy-npm/react-particle-backgrounds';
import { useModel } from 'umi';
import { getColorThemeById } from '@/config/colorThemes';

interface ParticlesBackgroundProps {
  isDark?: boolean;
}

const ParticlesBackground: React.FC<ParticlesBackgroundProps> = ({ isDark = true }) => {
  const { themeId } = useModel('particleModel');
  const { themeId: colorThemeId } = useModel('colorModel');
  const themeColor = getColorThemeById(colorThemeId).primary;

  return <RPB theme={themeId} isDark={isDark} themeColor={themeColor} />;
};

export default ParticlesBackground;
