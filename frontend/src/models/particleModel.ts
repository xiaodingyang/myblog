import { useState, useCallback, useEffect } from 'react';

const STORAGE_KEY = 'particle-theme-id';
const DEFAULT_PARTICLE_THEME_ID = 'dark-mint';

function normalizeParticleThemeId(id: string | null | undefined): string {
  if (!id) return DEFAULT_PARTICLE_THEME_ID;
  // 旧版博客自建 id，已合并到 npm 包内置 tyndall
  if (id === 'tyndall-rain') return 'tyndall';
  return id;
}

export default function useParticleModel() {
  const [themeId, setThemeId] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const raw = localStorage.getItem(STORAGE_KEY);
      const normalized = normalizeParticleThemeId(raw);
      if (raw && raw !== normalized) {
        localStorage.setItem(STORAGE_KEY, normalized);
      }
      return normalized;
    }
    return DEFAULT_PARTICLE_THEME_ID;
  });

  const changeTheme = useCallback((id: string) => {
    setThemeId(id);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, id);
    }
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    const normalized = normalizeParticleThemeId(saved);
    if (saved && saved !== normalized) {
      localStorage.setItem(STORAGE_KEY, normalized);
      setThemeId(normalized);
      return;
    }
    if (saved && saved !== themeId) {
      setThemeId(saved);
    }
  }, []);

  return {
    themeId,
    changeTheme,
  };
}
