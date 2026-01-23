import { useState, useCallback, useEffect } from 'react';
import { DEFAULT_COLOR_THEME_ID } from '@/config/colorThemes';

const STORAGE_KEY = 'color-theme-id';

export default function useColorModel() {
  const [themeId, setThemeId] = useState<string>(() => {
    // 从 localStorage 读取保存的主题
    if (typeof window !== 'undefined') {
      return localStorage.getItem(STORAGE_KEY) || DEFAULT_COLOR_THEME_ID;
    }
    return DEFAULT_COLOR_THEME_ID;
  });

  // 切换主题
  const changeTheme = useCallback((id: string) => {
    setThemeId(id);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, id);
    }
  }, []);

  // 初始化时从 localStorage 读取
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && saved !== themeId) {
      setThemeId(saved);
    }
  }, []);

  return {
    themeId,
    changeTheme,
  };
}
