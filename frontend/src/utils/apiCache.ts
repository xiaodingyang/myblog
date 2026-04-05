interface CacheEntry<T> { data: T; expireAt: number; }

const cache = new Map<string, CacheEntry<any>>();

export function setCache<T>(key: string, data: T, ttlMs: number): void {
  cache.set(key, { data, expireAt: Date.now() + ttlMs });
}

export function getCache<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expireAt) { cache.delete(key); return null; }
  return entry.data as T;
}

export function clearCache(prefix?: string): void {
  if (!prefix) { cache.clear(); return; }
  for (const key of cache.keys()) {
    if (key.startsWith(prefix)) cache.delete(key);
  }
}

/** 带缓存的请求封装 */
export async function cachedRequest<T>(
  url: string,
  params: Record<string, any> = {},
  ttlMs: number = 5 * 60 * 1000, // 默认 5 分钟
): Promise<T> {
  const cacheKey = `${url}?${new URLSearchParams(params).toString()}`;
  const cached = getCache<T>(cacheKey);
  if (cached) return cached;

  const { request } = await import('umi');
  const res = await request<T>(url, { params });
  setCache(cacheKey, res, ttlMs);
  return res;
}
