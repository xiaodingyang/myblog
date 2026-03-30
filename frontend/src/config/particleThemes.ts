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

export const particleThemes: ParticleTheme[] = [...mergedLibThemes, noneTheme];

export const getThemeById = (id: string): ParticleTheme => {
  if (id === 'none') return noneTheme;
  return libGetThemeById(id);
};

export { DEFAULT_THEME_ID };
export type { ParticleTheme };
