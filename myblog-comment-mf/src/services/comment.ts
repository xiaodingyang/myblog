import type { Comment } from '@/types/comment';

const isDev = process.env.NODE_ENV === 'development';

export async function fetchComments(
  articleId: string,
  page = 1,
  pageSize = 10,
): Promise<{ list: Comment[]; total: number }> {
  try {
    const response = await fetch(
      `/api/comments/article/${encodeURIComponent(articleId)}?page=${page}&pageSize=${pageSize}`,
    );
    const data = await response.json();
    return {
      list: data?.data?.list || [],
      total: data?.data?.total || 0,
    };
  } catch {
    return { list: [], total: 0 };
  }
}

export async function postComment(articleId: string, content: string, token: string): Promise<Comment> {
  // 开发环境模拟 API 返回（避免 token 无效）
  if (isDev && token === 'dev-token') {
    await new Promise((r) => setTimeout(r, 800)); // 模拟网络延迟
    return {
      _id: String(Date.now()),
      content,
      user: { username: '开发测试用户' },
      createdAt: new Date().toISOString(),
    };
  }

  const response = await fetch('/api/comments', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ articleId, content }),
  });
  const data = await response.json();
  if (data.code !== 0) throw new Error(data.message);
  return data.data;
}
