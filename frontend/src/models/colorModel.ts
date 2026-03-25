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

  // Bug Fix #5: 添加条件防止循环更新
  // 仅在 mounted 后首次检查并同步 localStorage 中的主题到状态
  // 避免 themeId 在外部被重置后导致无限循环更新
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && saved !== themeId) {
      // 使用 setThemeId 的函数式更新形式，确保与最新状态对比
      // 但由于 useEffect 无依赖且我们已有条件检查，不会造成循环
      setThemeId(saved);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 只在挂载时执行一次，后续 themeId 变化不触发

  return {
    themeId,
    changeTheme,
  };
}
