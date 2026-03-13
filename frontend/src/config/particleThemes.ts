import {
  particleThemes as libThemes,
  getThemeById as libGetThemeById,
  DEFAULT_THEME_ID,
  baseConfig,
} from '@xdy-npm/react-particle-backgrounds';
import type { ParticleTheme } from '@xdy-npm/react-particle-backgrounds';

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

export const particleThemes: ParticleTheme[] = [...libThemes, noneTheme];

export const getThemeById = (id: string): ParticleTheme => {
  if (id === 'none') return noneTheme;
  return libGetThemeById(id);
};

export { DEFAULT_THEME_ID };
export type { ParticleTheme };
