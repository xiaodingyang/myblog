import React from 'react';
import { ParticlesBackground as RPB } from '@xdy-npm/react-particle-backgrounds';
import { useModel } from 'umi';

interface ParticlesBackgroundProps {
  isDark?: boolean;
}

const ParticlesBackground: React.FC<ParticlesBackgroundProps> = ({ isDark = true }) => {
  const { themeId } = useModel('particleModel');

  return <RPB theme={themeId} isDark={isDark} />;
};

export default ParticlesBackground;
