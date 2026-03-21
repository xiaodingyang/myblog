import { useState, useCallback, useEffect } from 'react';
import { DEFAULT_COLOR_THEME_ID } from '@/config/colorThemes';
import { request } from 'umi';

const STORAGE_KEY = 'color-theme-id';

export default function useColorModel() {
  const [themeId, setThemeId] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(STORAGE_KEY) || DEFAULT_COLOR_THEME_ID;
    }
    return DEFAULT_COLOR_THEME_ID;
  });

  const changeTheme = useCallback((id: string) => {
    setThemeId(id);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, id);

      const token = localStorage.getItem('github_token');
      if (token) {
        request('/api/github/theme', {
          method: 'PUT',
          headers: { Authorization: `Bearer ${token}` },
          data: { themeId: id },
        }).catch(() => {});
      }
    }
  }, []);

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
