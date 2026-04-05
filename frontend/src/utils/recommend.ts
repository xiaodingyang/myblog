import { getReadingHistory } from '@/components/ReadingHistory';

/** 获取已读文章 ID 集合 */
export function getReadArticleIds(): Set<string> {
  return new Set(getReadingHistory().map(h => h.articleId));
}

/** 基于热度的推荐排序（未登录或无历史的降级方案） */
export function sortByPopularity(articles: API.Article[]): API.Article[] {
  return [...articles].sort((a, b) => (b.views || 0) - (a.views || 0));
}
