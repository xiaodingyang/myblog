import { useState, useCallback, useEffect } from 'react';
import { DEFAULT_THEME_ID } from '@xdy-npm/react-particle-backgrounds';

const STORAGE_KEY = 'particle-theme-id';

export default function useParticleModel() {
  const [themeId, setThemeId] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(STORAGE_KEY) || DEFAULT_THEME_ID;
    }
    return DEFAULT_THEME_ID;
  });

  const changeTheme = useCallback((id: string) => {
    setThemeId(id);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, id);
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
