import type { ISourceOptions } from '@tsparticles/engine';
import { colorThemes } from './colorThemes';

export interface ParticleTheme {
  id: string;
  name: string;
  icon: string;
  description: string;
  isThreeJS?: boolean; // 是否使用 Three.js 渲染
  options: (isDark: boolean) => ISourceOptions;
  // 主题背景色配置
  backgroundColor?: string; // 单色背景
  backgroundGradient?: string; // 渐变背景（CSS gradient）
  headerBackground?: string; // 头部背景色
  headerTextColor?: string; // 头部文字颜色
}

// 基础配置
const baseConfig: Partial<ISourceOptions> = {
  fullScreen: {
    enable: true,
    zIndex: 0, // 粒子层级，内容需要用更高的 z-index
  },
  background: {
    color: {
      value: 'transparent',
    },
  },
  fpsLimit: 120,
  detectRetina: true,
};

// 获取所有主题色的主色数组
const getAllThemeColors = (): string[] => {
  return colorThemes.map(theme => theme.primary);
};

// 主题1: 星空连线（原主题）
const starlineTheme: ParticleTheme = {
  id: 'starline',
  name: '星空连线',
  icon: '✨',
  description: '经典的粒子连线效果',
  backgroundGradient: 'linear-gradient(180deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
  headerBackground: 'rgba(15, 23, 42, 0.9)',
  headerTextColor: '#fff',
  options: (isDark: boolean) => {
    // 获取所有主题色
    const allColors = getAllThemeColors();
    
    return {
      ...baseConfig,
      interactivity: {
        detectsOn: 'window',
        events: {
          onClick: { enable: true, mode: 'push' },
          onHover: { enable: true, mode: 'grab' },
          resize: { enable: true },
        },
        modes: {
          push: { quantity: 6 },
          grab: {
            distance: 200,
            links: { 
              opacity: 1, 
              color: allColors, // 从所有主题色中随机选择
            },
          },
        },
      },
      particles: {
        color: {
          value: allColors, // 从所有主题色中随机选择
        },
        links: {
          color: allColors, // 从所有主题色中随机选择
          distance: 150,
          enable: true,
          opacity: 0.5,
          width: 1,
        },
        move: {
          direction: 'none',
          enable: true,
          outModes: { default: 'out' },
          random: false,
          speed: 2,
          straight: false,
        },
        number: {
          density: { enable: true, width: 1920, height: 1080 },
          value: 100,
        },
        opacity: { value: 0.7 },
        shape: { type: 'circle' },
        size: { value: { min: 2, max: 6 } },
        shadow: {
          blur: 8,
          color: { value: allColors }, // 从所有主题色中随机选择
          enable: true,
          offset: { x: 0, y: 0 },
        },
      },
    };
  },
};

// 主题2: 雪花飘落
const snowTheme: ParticleTheme = {
  id: 'snow',
  name: '雪花飘落',
  icon: '❄️',
  description: '浪漫的雪花飘落效果',
  backgroundGradient: 'linear-gradient(180deg, #1e3a5f 0%, #2d4a6b 50%, #3d5a7b 100%)',
  headerBackground: 'rgba(30, 58, 95, 0.9)',
  headerTextColor: '#fff',
  options: (isDark: boolean) => ({
    ...baseConfig,
    interactivity: {
      detectsOn: 'window',
      events: {
        onHover: { enable: true, mode: 'repulse' },
        resize: { enable: true },
      },
      modes: {
        repulse: { distance: 100, duration: 0.4 },
      },
    },
    particles: {
      color: { value: isDark ? '#ffffff' : '#87CEEB' },
      move: {
        direction: 'bottom',
        enable: true,
        outModes: { default: 'out' },
        speed: { min: 1, max: 3 },
        straight: false,
        drift: { min: -0.5, max: 0.5 },
      },
      number: {
        density: { enable: true, width: 1920, height: 1080 },
        value: 80,
      },
      opacity: {
        value: { min: 0.3, max: 0.8 },
        animation: { enable: true, speed: 1, minimumValue: 0.3, sync: false },
      },
      shape: { type: 'circle' },
      size: { value: { min: 2, max: 6 } },
      wobble: {
        enable: true,
        distance: 10,
        speed: { min: -5, max: 5 },
      },
      shadow: {
        blur: 5,
        color: { value: isDark ? '#ffffff' : '#87CEEB' },
        enable: true,
        offset: { x: 0, y: 0 },
      },
    },
  }),
};

// 主题3: 气泡上升
const bubbleTheme: ParticleTheme = {
  id: 'bubble',
  name: '气泡上升',
  icon: '🫧',
  description: '梦幻的气泡上升效果',
  backgroundGradient: 'linear-gradient(180deg, #0a2647 0%, #144272 50%, #205295 100%)',
  headerBackground: 'rgba(10, 38, 71, 0.9)',
  headerTextColor: '#fff',
  options: (isDark: boolean) => ({
    ...baseConfig,
    interactivity: {
      detectsOn: 'window',
      events: {
        onClick: { enable: true, mode: 'pop' },
        onHover: { enable: true, mode: 'bubble' },
        resize: { enable: true },
      },
      modes: {
        bubble: { distance: 200, size: 15, duration: 2, opacity: 0.8 },
        pop: {},
      },
    },
    particles: {
      color: {
        value: isDark
          ? ['#00d9ff', '#00ff9d', '#ff00e6', '#ffee00']
          : ['#ffb3d9', '#ff91c7', '#ffc0e5', '#ffd6e8'], // 淡粉色系
      },
      move: {
        direction: 'top',
        enable: true,
        outModes: { default: 'out' },
        speed: { min: 1, max: 2 },
        straight: false,
      },
      number: {
        density: { enable: true, width: 1920, height: 1080 },
        value: 50,
      },
      opacity: {
        value: { min: 0.2, max: 0.6 },
        animation: { enable: true, speed: 0.5, minimumValue: 0.1, sync: false },
      },
      shape: { type: 'circle' },
      size: {
        value: { min: 5, max: 15 },
        animation: { enable: true, speed: 3, minimumValue: 3, sync: false },
      },
      stroke: {
        width: 1,
        color: { value: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.1)' },
      },
      shadow: {
        blur: 10,
        color: { value: isDark ? '#ffb3d9' : '#ff91c7' }, // 淡粉色
        enable: true,
        offset: { x: 0, y: 0 },
      },
    },
  }),
};

// 主题4: 星星闪烁
const starsTheme: ParticleTheme = {
  id: 'stars',
  name: '星星闪烁',
  icon: '⭐',
  description: '闪烁的星空效果',
  backgroundGradient: 'linear-gradient(180deg, #000000 0%, #1a1a2e 50%, #16213e 100%)',
  headerBackground: 'rgba(0, 0, 0, 0.9)',
  headerTextColor: '#fff',
  options: (isDark: boolean) => ({
    ...baseConfig,
    interactivity: {
      detectsOn: 'window',
      events: {
        onClick: { enable: true, mode: 'push' },
        onHover: { enable: true, mode: 'connect' },
        resize: { enable: true },
      },
      modes: {
        push: { quantity: 3 },
        connect: { distance: 100, links: { opacity: 0.3 }, radius: 150 },
      },
    },
    particles: {
      color: {
        value: isDark
          ? ['#ffffff', '#ffffd4', '#ffecd2', '#d4f1ff']
          : ['#ffd700', '#ffb347', '#ff6b6b', '#4ecdc4'],
      },
      move: {
        direction: 'none',
        enable: true,
        outModes: { default: 'out' },
        random: true,
        speed: 0.5,
        straight: false,
      },
      number: {
        density: { enable: true, width: 1920, height: 1080 },
        value: 120,
      },
      opacity: {
        value: { min: 0.2, max: 1 },
        animation: {
          enable: true,
          speed: 1,
          minimumValue: 0.1,
          sync: false,
        },
      },
      shape: { type: 'star', options: { star: { sides: 5 } } },
      size: { value: { min: 1, max: 4 } },
      twinkle: {
        lines: { enable: false },
        particles: {
          enable: true,
          frequency: 0.05,
          opacity: 1,
          color: { value: isDark ? '#ffffff' : '#ffd700' },
        },
      },
      shadow: {
        blur: 6,
        color: { value: isDark ? '#ffffff' : '#ffd700' },
        enable: true,
        offset: { x: 0, y: 0 },
      },
    },
  }),
};

// 主题5: 萤火虫
const fireflyTheme: ParticleTheme = {
  id: 'firefly',
  name: '萤火虫',
  icon: '🪲',
  description: '温馨的萤火虫效果',
  backgroundGradient: 'linear-gradient(180deg, #1a1a1a 0%, #2d2d2d 50%, #1a1a1a 100%)',
  headerBackground: 'rgba(26, 26, 26, 0.9)',
  headerTextColor: '#fff',
  options: (isDark: boolean) => ({
    ...baseConfig,
    interactivity: {
      detectsOn: 'window',
      events: {
        onHover: { enable: true, mode: 'slow' },
        resize: { enable: true },
      },
      modes: {
        slow: { factor: 3, radius: 200 },
      },
    },
    particles: {
      color: {
        value: isDark
          ? ['#ffff00', '#adff2f', '#7fff00', '#00ff7f']
          : ['#ffc107', '#ff9800', '#ff5722', '#4caf50'],
      },
      move: {
        direction: 'none',
        enable: true,
        outModes: { default: 'bounce' },
        random: true,
        speed: 1,
        straight: false,
        trail: {
          enable: true,
          length: 5,
          fill: { color: 'transparent' },
        },
      },
      number: {
        density: { enable: true, width: 1920, height: 1080 },
        value: 40,
      },
      opacity: {
        value: { min: 0.3, max: 1 },
        animation: {
          enable: true,
          speed: 2,
          minimumValue: 0.1,
          sync: false,
        },
      },
      shape: { type: 'circle' },
      size: { value: { min: 2, max: 5 } },
      shadow: {
        blur: 15,
        color: { value: isDark ? '#adff2f' : '#ffc107' },
        enable: true,
        offset: { x: 0, y: 0 },
      },
    },
  }),
};

// 主题6: 几何漂浮
const geometryTheme: ParticleTheme = {
  id: 'geometry',
  name: '几何漂浮',
  icon: '🔷',
  description: '抽象的几何图形效果',
  backgroundGradient: 'linear-gradient(180deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
  headerBackground: 'rgba(15, 12, 41, 0.9)',
  headerTextColor: '#fff',
  options: (isDark: boolean) => ({
    ...baseConfig,
    interactivity: {
      detectsOn: 'window',
      events: {
        onClick: { enable: true, mode: 'push' },
        onHover: { enable: true, mode: 'repulse' },
        resize: { enable: true },
      },
      modes: {
        push: { quantity: 2 },
        repulse: { distance: 150, duration: 0.4 },
      },
    },
    particles: {
      color: {
        value: isDark
          ? ['#ffb3d9', '#ff91c7', '#ffc0e5', '#ffd6e8'] // 淡粉色系
          : ['#ffb3d9', '#ff91c7', '#ffc0e5', '#ffd6e8'], // 淡粉色系
      },
      move: {
        direction: 'none',
        enable: true,
        outModes: { default: 'bounce' },
        random: false,
        speed: 1.5,
        straight: false,
      },
      number: {
        density: { enable: true, width: 1920, height: 1080 },
        value: 30,
      },
      opacity: {
        value: { min: 0.3, max: 0.7 },
      },
      rotate: {
        value: { min: 0, max: 360 },
        direction: 'random',
        animation: { enable: true, speed: 5 },
      },
      shape: {
        type: ['triangle', 'square', 'polygon'],
        options: {
          polygon: { sides: 6 },
        },
      },
      size: { value: { min: 10, max: 25 } },
      stroke: {
        width: 1,
        color: { value: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.2)' },
      },
      shadow: {
        blur: 10,
        color: { value: isDark ? '#ffb3d9' : '#ff91c7' }, // 淡粉色
        enable: true,
        offset: { x: 2, y: 2 },
      },
    },
  }),
};

// 主题7: 粒子海洋波浪 (Three.js)
const waveTheme: ParticleTheme = {
  id: 'wave',
  name: '粒子海洋',
  icon: '🌊',
  description: '3D 粒子波浪效果',
  isThreeJS: true,
  backgroundGradient: 'linear-gradient(180deg, #000000 0%, #0a1628 50%, #0d1f3c 100%)',
  headerBackground: 'rgba(15, 23, 42, 0.9)',
  headerTextColor: '#fff',
  options: () => ({
    ...baseConfig,
    particles: {
      number: { value: 0 },
    },
  }),
};

// 主题8: 无特效
const noneTheme: ParticleTheme = {
  id: 'none',
  name: '关闭特效',
  icon: '🚫',
  description: '关闭粒子特效',
  backgroundColor: '#ffffff',
  headerBackground: 'rgba(255, 255, 255, 0.95)',
  headerTextColor: '#1e293b',
  options: () => ({
    ...baseConfig,
    particles: {
      number: { value: 0 },
    },
  }),
};

// 导出所有主题
export const particleThemes: ParticleTheme[] = [
  starlineTheme,
  snowTheme,
  bubbleTheme,
  starsTheme,
  fireflyTheme,
  geometryTheme,
  waveTheme,
  noneTheme,
];

// 根据 ID 获取主题
export const getThemeById = (id: string): ParticleTheme => {
  return particleThemes.find((theme) => theme.id === id) || starlineTheme;
};

// 默认主题 ID
export const DEFAULT_THEME_ID = 'starline';
