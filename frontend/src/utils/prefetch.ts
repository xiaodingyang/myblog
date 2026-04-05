// 简易预加载：提前请求文章详情 API 并缓存结果
const prefetchedArticles = new Map<string, any>();

export function fetchArticleDetail(id: string) {
  if (prefetchedArticles.has(id)) return;
  // 标记为已请求，避免重复
  prefetchedArticles.set(id, 'loading');
  fetch(`/api/articles/${id}`)
    .then(res => res.json())
    .then(data => { prefetchedArticles.set(id, data); })
    .catch(() => { prefetchedArticles.delete(id); });
}

export function getPrefetchedArticle(id: string) {
  const data = prefetchedArticles.get(id);
  if (data && data !== 'loading') return data;
  return null;
}
