import React, { useEffect, useMemo, useState } from 'react';
import Particles, { initParticlesEngine } from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';
import type { Container } from '@tsparticles/engine';
import { useModel } from 'umi';
import { getThemeById } from '@/config/particleThemes';
import ParticleWave from './ParticleWave';

interface ParticlesBackgroundProps {
  isDark?: boolean;
}

const ParticlesBackground: React.FC<ParticlesBackgroundProps> = ({ isDark = true }) => {
  const [init, setInit] = useState(false);
  const { themeId } = useModel('particleModel');
  const theme = getThemeById(themeId);

  // 初始化粒子引擎（只执行一次）
  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => {
      setInit(true);
    }).catch((error) => {
      console.error('Failed to initialize particles engine:', error);
      setInit(true); // 即使失败也设置 init 为 true，避免一直显示空白
    });
  }, []);

  const particlesLoaded = async (container?: Container) => {
    console.log('Particles loaded:', container);
  };

  // 根据当前主题获取配置
  const options = useMemo(() => {
    return theme.options(isDark);
  }, [theme, isDark]);

  // 如果是关闭特效，不渲染
  if (themeId === 'none') {
    return null;
  }

  // 如果是 Three.js 主题（粒子海洋）
  if (theme.isThreeJS) {
    return <ParticleWave />;
  }

  if (!init) {
    return null;
  }

  return (
    <Particles
      id="tsparticles"
      key={themeId} // 切换主题时强制重新渲染
      particlesLoaded={particlesLoaded}
      options={options}
    />
  );
};

export default ParticlesBackground;
