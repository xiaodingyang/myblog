/**
 * 与 Umi history.type 一致：browser 模式下使用 location.pathname。
 */
export function getRouterPathname(): string {
  if (typeof window === 'undefined') return '/';
  const p = window.location.pathname || '/';
  return p;
}

/**
 * GitHub OAuth：后端拼 FRONTEND_URL + returnUrl（当前页 path + query）。
 */
export function getOAuthReturnPath(): string {
  if (typeof window === 'undefined') return '/';
  const { pathname, search } = window.location;
  return `${pathname || '/'}${search || ''}`;
}
