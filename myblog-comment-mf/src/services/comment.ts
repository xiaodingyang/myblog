import type { Comment } from '@/types/comment';

const isDev = process.env.NODE_ENV === 'development';

export async function fetchComments(articleId: string): Promise<Comment[]> {
  try {
    const response = await fetch(`/api/comments?articleId=${articleId}&page=1&pageSize=50`);
    const data = await response.json();
    return data.data?.list || [];
  } catch {
    return [];
  }
}

export async function postComment(articleId: string, content: string, token: string): Promise<Comment> {
  // 开发环境模拟 API 返回（避免 token 无效）
  if (isDev && token === 'dev-token') {
    await new Promise((r) => setTimeout(r, 800)); // 模拟网络延迟
    return {
      _id: String(Date.now()),
      content,
      author: { username: '开发测试用户' },
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
