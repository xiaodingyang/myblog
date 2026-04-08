import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { request } from 'umi';

// ============ 类型定义 ============

interface PageResult<T> { list: T[]; total: number; page: number; pageSize: number; }
interface ApiResponse<T> { code: number; message: string; data: T; }

// ============ Query Key 工厂 ============

export const queryKeys = {
  articles: (params?: Record<string, any>) => ['articles', params] as const,
  article: (id: string) => ['article', id] as const,
  categories: () => ['categories'] as const,
  category: (id: string) => ['category', id] as const,
  tags: () => ['tags'] as const,
  tag: (id: string) => ['tag', id] as const,
  comments: (articleId: string, page?: number) => ['comments', articleId, page] as const,
  archives: () => ['archives'] as const,
  messages: (page?: number) => ['messages', page] as const,
  rankings: () => ['rankings'] as const,
};

// ============ 文章 Hooks ============

/** 文章列表 */
export function useArticles(params: {
  page?: number;
  pageSize?: number;
  keyword?: string;
  category?: string;
  tag?: string;
  sort?: string;
}) {
  return useQuery({
    queryKey: queryKeys.articles(params),
    queryFn: () =>
      request<ApiResponse<PageResult<API.Article>>>('/api/articles', { params }).then(r => r.data),
    staleTime: 5 * 60 * 1000,
  });
}

/** 文章详情 */
export function useArticle(id: string) {
  return useQuery({
    queryKey: queryKeys.article(id),
    queryFn: () =>
      request<ApiResponse<API.Article>>(`/api/articles/${id}`).then(r => r.data),
    enabled: !!id,
    staleTime: 10 * 60 * 1000,
  });
}

/** 文章归档 */
export function useArchives() {
  return useQuery({
    queryKey: queryKeys.archives(),
    queryFn: () =>
      request<ApiResponse<any>>('/api/articles/archives').then(r => r.data),
    staleTime: 10 * 60 * 1000,
  });
}

// ============ 分类 Hooks ============

/** 分类列表 */
export function useCategories() {
  return useQuery({
    queryKey: queryKeys.categories(),
    queryFn: () =>
      request<ApiResponse<API.Category[]>>('/api/categories').then(r => r.data),
    staleTime: 60 * 60 * 1000,
  });
}

/** 分类详情 */
export function useCategory(id: string) {
  return useQuery({
    queryKey: queryKeys.category(id),
    queryFn: () =>
      request<ApiResponse<API.Category>>(`/api/categories/${id}`).then(r => r.data),
    enabled: !!id,
    staleTime: 30 * 60 * 1000,
  });
}

// ============ 标签 Hooks ============

/** 标签列表 */
export function useTags() {
  return useQuery({
    queryKey: queryKeys.tags(),
    queryFn: () =>
      request<ApiResponse<API.Tag[]>>('/api/tags').then(r => r.data),
    staleTime: 60 * 60 * 1000,
  });
}

/** 标签详情 */
export function useTag(id: string) {
  return useQuery({
    queryKey: queryKeys.tag(id),
    queryFn: () =>
      request<ApiResponse<API.Tag>>(`/api/tags/${id}`).then(r => r.data),
    enabled: !!id,
    staleTime: 30 * 60 * 1000,
  });
}

// ============ 评论 Hooks ============

/** 评论列表 */
export function useComments(articleId: string, page: number = 1, pageSize: number = 10) {
  return useQuery({
    queryKey: queryKeys.comments(articleId, page),
    queryFn: () =>
      request<ApiResponse<PageResult<any>>>(`/api/comments/article/${articleId}`, {
        params: { page, pageSize },
      }).then(r => r.data),
    enabled: !!articleId,
    staleTime: 2 * 60 * 1000,
  });
}

// ============ Mutation Hooks（写操作后自动刷新缓存） ============

/** 文章点赞/取消点赞 */
export function useToggleArticleLike() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      request<ApiResponse<any>>(`/api/articles/${id}/like`, { method: 'POST' }),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.article(id) });
    },
  });
}

/** 发表评论 */
export function useCreateComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { articleId: string; content: string }) =>
      request<ApiResponse<any>>(`/api/comments/article/${data.articleId}`, {
        method: 'POST',
        data: { content: data.content },
      }),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.comments(vars.articleId) });
      queryClient.invalidateQueries({ queryKey: ['articles'] });
    },
  });
}
