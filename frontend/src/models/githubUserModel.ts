import { useState, useCallback, useEffect } from 'react';

export interface GithubUserInfo {
  _id: string;
  username: string;
  nickname: string;
  avatar: string;
  htmlUrl: string;
}

// #region agent log
console.log('[DEBUG-63a015] githubUserModel module loaded OK');
// #endregion

const STORAGE_KEY_TOKEN = 'github_token';
const STORAGE_KEY_USER = 'github_user';

export default function useGithubUserModel() {
  const [githubUser, setGithubUser] = useState<GithubUserInfo | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_USER);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [githubToken, setGithubToken] = useState<string | null>(() => {
    return localStorage.getItem(STORAGE_KEY_TOKEN);
  });

  const [loginModalVisible, setLoginModalVisible] = useState(false);

  const isLoggedIn = !!(githubToken && githubUser);

  const login = useCallback((token: string, user: GithubUserInfo) => {
    localStorage.setItem(STORAGE_KEY_TOKEN, token);
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
    setGithubToken(token);
    setGithubUser(user);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY_TOKEN);
    localStorage.removeItem(STORAGE_KEY_USER);
    setGithubToken(null);
    setGithubUser(null);
  }, []);

  const requireAuth = useCallback((callback?: () => void) => {
    if (isLoggedIn) {
      callback?.();
      return true;
    }
    setLoginModalVisible(true);
    return false;
  }, [isLoggedIn]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const url = new URL(window.location.href);
    const token = url.searchParams.get('github_token');
    const userStr = url.searchParams.get('github_user');

    if (token && userStr) {
      try {
        const user = JSON.parse(decodeURIComponent(userStr));
        login(token, user);
      } catch {
        // ignore parse error
      }
      url.searchParams.delete('github_token');
      url.searchParams.delete('github_user');
      window.history.replaceState({}, '', url.pathname + url.search + url.hash);
    }
  }, [login]);

  return {
    githubUser,
    githubToken,
    isLoggedIn,
    loginModalVisible,
    setLoginModalVisible,
    login,
    logout,
    requireAuth,
  };
}
