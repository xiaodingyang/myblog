export interface ColorTheme {
  id: string;
  name: string;
  primary: string; // 主色
  gradient: string; // 渐变色
  description: string;
}

// 时尚漂亮的主题色配置
export const colorThemes: ColorTheme[] = [
  {
    id: 'pink',
    name: '淡粉樱花',
    primary: '#ffb3d9',
    gradient: 'linear-gradient(135deg, #ffb3d9 0%, #ff91c7 100%)',
    description: '温柔的淡粉色系',
  },
  {
    id: 'rose',
    name: '樱桃红',
    primary: '#f43f5e',
    gradient: 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)',
    description: '活力的樱桃红色',
  },
  {
    id: 'lavender',
    name: '薰衣草紫',
    primary: '#a78bfa',
    gradient: 'linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%)',
    description: '梦幻的紫色系',
  },
  {
    id: 'ocean',
    name: '海洋蓝',
    primary: '#3b82f6',
    gradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
    description: '清新的蓝色系',
  },
  {
    id: 'mint',
    name: '薄荷绿',
    primary: '#10b981',
    gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    description: '清新的绿色系',
  },
  {
    id: 'amber',
    name: '琥珀橙',
    primary: '#f59e0b',
    gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    description: '温暖的橙色系',
  },
  {
    id: 'coral',
    name: '珊瑚红',
    primary: '#ff6b6b',
    gradient: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%)',
    description: '活力的珊瑚色',
  },
  {
    id: 'violet',
    name: '紫罗兰',
    primary: '#8b5cf6',
    gradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
    description: '神秘的紫色系',
  },
  {
    id: 'cyan',
    name: '青蓝色',
    primary: '#06b6d4',
    gradient: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
    description: '清爽的青蓝色',
  },
  {
    id: 'peach',
    name: '蜜桃粉',
    primary: '#fb7185',
    gradient: 'linear-gradient(135deg, #fb7185 0%, #f43f5e 100%)',
    description: '甜美的蜜桃色',
  },
];

// 根据 ID 获取主题
export const getColorThemeById = (id: string): ColorTheme => {
  return colorThemes.find((theme) => theme.id === id) || colorThemes[0];
};

// 默认主题 ID
export const DEFAULT_COLOR_THEME_ID = 'pink';
