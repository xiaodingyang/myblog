import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { request } from 'umi';

// ============ 类型定义 ============

interface PageResult<T> { list: T[]; total: number; page: number; pageSize: number; }
interface ApiResponse<T> { code: number; message: string; data: T; }

/** 接口 `data` 可能为 `null` 或非数组；解构默认值无法覆盖 `null`，否则页面 `.map` / 展开会白屏 */
function safeList<T>(data: unknown): T[] {
  return Array.isArray(data) ? data : [];
}

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
    queryFn: async () => {
      try {
        const res = await request<ApiResponse<API.Article>>(`/api/articles/${id}`);
        // 接口返回成功但数据为空，视为文章不存在
        if (res.code === 404 || !res.data) {
          return null;
        }
        return res.data;
      } catch (error: any) {
        // 404/400 错误返回 null（文章不存在或 ID 无效）
        const status = error?.response?.status || error?.response?.data?.code;
        if (status === 404 || status === 400) {
          return null;
        }
        throw error;
      }
    },
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
      request<ApiResponse<API.Category[]>>('/api/categories').then((r) =>
        safeList<API.Category>(r?.data),
      ),
    staleTime: 60 * 60 * 1000,
  });
}

/** 分类详情 */
export function useCategory(id: string) {
  return useQuery({
    queryKey: queryKeys.category(id),
    queryFn: async () => {
      try {
        const res = await request<ApiResponse<API.Category>>(`/api/categories/${id}`);
        if (!res.data) return null;
        return res.data;
      } catch (error: any) {
        // 404/400 错误返回 null（分类不存在或 ID 无效）
        const status = error?.response?.status || error?.response?.data?.code;
        if (status === 404 || status === 400) {
          return null;
        }
        throw error;
      }
    },
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
      request<ApiResponse<API.Tag[]>>('/api/tags').then((r) => safeList<API.Tag>(r?.data)),
    staleTime: 60 * 60 * 1000,
  });
}

/** 标签详情 */
export function useTag(id: string) {
  return useQuery({
    queryKey: queryKeys.tag(id),
    queryFn: async () => {
      try {
        const res = await request<ApiResponse<API.Tag>>(`/api/tags/${id}`);
        if (!res.data) return null;
        return res.data;
      } catch (error: any) {
        // 404/400 错误返回 null（标签不存在或 ID 无效）
        const status = error?.response?.status || error?.response?.data?.code;
        if (status === 404 || status === 400) {
          return null;
        }
        throw error;
      }
    },
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
