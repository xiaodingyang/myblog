import { useState, useCallback, useOptimistic, useMemo, Suspense } from 'react';
import { Card, Typography, Divider, Spin } from 'antd';
import CommentForm from './CommentForm';
import CommentList from './CommentList';
import { fetchComments, postComment } from '@/services/comment';
import type { Comment } from '@/types/comment';

const { Title } = Typography;

interface CommentSectionProps {
  articleId: string;
  token?: string;
  username?: string;
}

export default function CommentSection({ articleId, token, username }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [initialized, setInitialized] = useState(false);

  const commentsPromise = useMemo(
    () =>
      fetchComments(articleId).then((data) => {
        setComments(data);
        setInitialized(true);
        return data;
      }),
    [articleId]
  );

  const [optimisticComments, addOptimistic] = useOptimistic(
    comments,
    (currentComments: Comment[], newComment: Comment) => {
      return [newComment, ...currentComments];
    }
  );

  const handleSubmit = useCallback(
    async (content: string) => {
      const optimisticComment: Comment = {
        _id: 'temp-' + Date.now(),
        content,
        author: { username: username || '我' },
        createdAt: new Date().toISOString(),
        pending: true,
      };

      addOptimistic(optimisticComment);

      const realComment = await postComment(articleId, content, token!);
      setComments((prev) => [realComment, ...prev]);
    },
    [articleId, token, username, addOptimistic]
  );

  return (
    <Card
      style={{
        borderRadius: 16,
        border: 'none',
        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
      }}
    >
      <Title level={4} style={{ marginBottom: 24 }}>
        💬 评论
      </Title>

      <CommentForm onSubmit={handleSubmit} token={token} username={username} />
      <Divider />

      <Suspense fallback={<Spin tip="加载评论中..." />}>
        <CommentList
          commentsPromise={commentsPromise}
          optimisticComments={initialized ? optimisticComments : undefined}
        />
      </Suspense>
    </Card>
  );
}
