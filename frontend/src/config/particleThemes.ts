import {
  particleThemes as libThemes,
  getThemeById as libGetThemeById,
  DEFAULT_THEME_ID,
  baseConfig,
  tyndallTheme,
} from '@xdy-npm/react-particle-backgrounds';
import type { ParticleTheme } from '@xdy-npm/react-particle-backgrounds';

// 显式合并丁达尔主题：避免旧构建/缓存导致列表缺项；并保持紧挨在「关闭特效」上方
const mergedLibThemes = (() => {
  const rest = libThemes.filter((t) => t.id !== 'tyndall');
  return [...rest, tyndallTheme];
})();

// 博客特有主题：深色薄荷混合
const darkMintTheme: ParticleTheme = {
  id: 'dark-mint',
  name: '深色薄荷',
  icon: '🌿',
  description: '深色背景与薄荷绿粒子的混合',
  backgroundColor: '#18212c',
  options: () => ({
    ...baseConfig,
    particles: {
      number: { value: 80, density: { enable: true, value_area: 800 } },
      color: { value: '#10b981' },
      shape: { type: 'circle' },
      opacity: {
        value: 0.5,
        random: true,
        anim: { enable: true, speed: 1, opacity_min: 0.1, sync: false },
      },
      size: {
        value: 3,
        random: true,
        anim: { enable: true, speed: 2, size_min: 0.1, sync: false },
      },
      line_linked: {
        enable: true,
        distance: 150,
        color: '#10b981',
        opacity: 0.4,
        width: 1,
      },
      move: {
        enable: true,
        speed: 2,
        direction: 'none',
        random: false,
        straight: false,
        out_mode: 'out',
        bounce: false,
      },
    },
    interactivity: {
      detect_on: 'canvas',
      events: {
        onhover: { enable: true, mode: 'grab' },
        onclick: { enable: true, mode: 'push' },
        resize: true,
      },
      modes: {
        grab: { distance: 140, line_linked: { opacity: 1 } },
        push: { particles_nb: 4 },
      },
    },
  }),
};

// 博客特有的「关闭特效」主题
const noneTheme: ParticleTheme = {
  id: 'none',
  name: '关闭特效',
  icon: '🚫',
  description: '关闭粒子特效',
  backgroundColor: '#ffffff',
  options: () => ({
    ...baseConfig,
    particles: { number: { value: 0 } },
  }),
};

export const particleThemes: ParticleTheme[] = [...mergedLibThemes, darkMintTheme, noneTheme];

export const getThemeById = (id: string): ParticleTheme => {
  if (id === 'none') return noneTheme;
  if (id === 'dark-mint') return darkMintTheme;
  return libGetThemeById(id);
};

export { DEFAULT_THEME_ID };
export type { ParticleTheme };
