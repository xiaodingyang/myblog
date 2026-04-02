/**
 * 与 Umi history.type 一致的路由路径（hash 模式下取自 location.hash）。
 */
export function getRouterPathname(): string {
  if (typeof window === 'undefined') return '/';
  const { hash, pathname } = window.location;
  if (hash.length > 1 && hash.startsWith('#')) {
    const pathAndQuery = hash.slice(1);
    const q = pathAndQuery.indexOf('?');
    const pathOnly = q >= 0 ? pathAndQuery.slice(0, q) : pathAndQuery;
    if (pathOnly.startsWith('/')) return pathOnly;
    return pathOnly ? `/${pathOnly}` : '/';
  }
  return pathname || '/';
}

/**
 * GitHub OAuth：后端拼 FRONTEND_URL + returnUrl。
 * hash 路由时必须带上 /#/path，否则回调后落在首页。
 */
export function getOAuthReturnPath(): string {
  if (typeof window === 'undefined') return '/';
  const { hash, pathname, search } = window.location;
  if (hash.startsWith('#/')) {
    return `/${hash}`;
  }
  return `${pathname || '/'}${search || ''}`;
}
