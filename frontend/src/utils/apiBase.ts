/**
 * 与 `.umirc.ts` 中 `define.process.env.API_BASE_URL` 对齐：生产为直连后端，开发为 localhost。
 * 用于少数不走 umi `request` 的跳转（如 GitHub OAuth 整页重定向）。
 */
export function getClientApiBase(): string {
  const raw =
    typeof process !== 'undefined' && (process as unknown as { env?: { API_BASE_URL?: string } }).env?.API_BASE_URL;
  if (!raw || typeof raw !== 'string') return '';
  return raw.trim().replace(/\/+$/, '');
}

/** 有绝对 API 根时拼成绝对 URL，否则返回相对路径（依赖同域 Nginx 反代 /api） */
export function buildApiUrl(path: string): string {
  const p = path.startsWith('/') ? path : `/${path}`;
  const base = getClientApiBase();
  if (!base) return p;
  if (/^https?:\/\//i.test(base)) return `${base}${p}`;
  return p;
}
