import { useState, useCallback, useEffect } from 'react';
import { Typography, Avatar, Input, Button, List, Pagination, Empty, message } from 'antd';
import { GithubOutlined, ClockCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { fetchComments, postComment } from '@/services/comment';
import type { Comment } from '@/types/comment';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

interface CommentSectionProps {
  articleId: string;
  token?: string;
  username?: string;
}

export default function CommentSection({ articleId, token, username }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentLoading, setCommentLoading] = useState(false);
  const [commentTotal, setCommentTotal] = useState(0);
  const [commentPage, setCommentPage] = useState(1);
  const [commentContent, setCommentContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const commentPageSize = 10;
  const primary = 'var(--theme-primary, #ffb3d9)';
  const panelStyle = {
    borderRadius: 14,
    border: '1px solid rgba(148, 163, 184, 0.16)',
    background: 'linear-gradient(135deg, rgba(255,255,255,0.88) 0%, rgba(248,250,252,0.92) 100%)',
    boxShadow: '0 10px 30px rgba(15, 23, 42, 0.06)',
    backdropFilter: 'blur(8px)',
  };

  const loadComments = useCallback(async (page: number) => {
    setCommentLoading(true);
    try {
      const data = await fetchComments(articleId, page, commentPageSize);
      setComments(data.list);
      setCommentTotal(data.total);
    } finally {
      setCommentLoading(false);
    }
  }, [articleId]);

  useEffect(() => {
    setCommentPage(1);
    loadComments(1);
  }, [loadComments]);

  const handleSubmit = useCallback(
    async (content: string) => {
      if (!token || !username) {
        message.warning('登录 GitHub 后即可发表评论');
        return;
      }
      if (!content.trim() || content.trim().length < 2) {
        message.warning('评论内容至少2个字符');
        return;
      }
      setSubmitting(true);
      try {
        await postComment(articleId, content.trim(), token);
        message.success('评论发表成功');
        setCommentContent('');
        setCommentPage(1);
        await loadComments(1);
      } catch (error: any) {
        message.error(error?.message || '评论发表失败');
      } finally {
        setSubmitting(false);
      }
    },
    [articleId, token, username, loadComments]
  );

  return (
    <div>
      <Title level={4} style={{ marginBottom: 18 }}>
        💬 评论 {commentTotal > 0 && `(${commentTotal})`}
      </Title>

      <div style={{ ...panelStyle, marginBottom: 24, padding: 16 }}>
        {token && username ? (
          <div style={{ display: 'flex', gap: 12 }}>
            <Avatar
              size={40}
              icon={<GithubOutlined />}
              style={{ flexShrink: 0, background: `linear-gradient(135deg, ${primary}, #ffd7ea)` }}
            />
            <div style={{ flex: 1 }}>
              <TextArea
                value={commentContent}
                onChange={(e) => setCommentContent(e.target.value)}
                placeholder="写下你的评论..."
                rows={3}
                showCount
                maxLength={500}
                style={{
                  borderRadius: 10,
                  borderColor: 'rgba(148, 163, 184, 0.32)',
                  background: 'rgba(255,255,255,0.9)',
                }}
              />
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 16 }}>
                <Text type="secondary" style={{ fontSize: 14 }}>
                  以 <Text strong>{username}</Text> 的身份评论
                </Text>
                <Button
                  type="primary"
                  onClick={() => handleSubmit(commentContent)}
                  loading={submitting}
                  style={{
                    marginTop: 4,
                    borderRadius: 999,
                    border: 'none',
                    backgroundImage: `linear-gradient(135deg, ${primary} 0%, #ff84b7 100%)`,
                    boxShadow: '0 8px 18px rgba(255, 132, 183, 0.32)',
                    fontWeight: 600,
                  }}
                >
                  发表评论
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div
            style={{
              textAlign: 'center',
              padding: '16px 12px',
              borderRadius: 12,
              background: 'linear-gradient(135deg, rgba(255,255,255,0.92) 0%, rgba(248,250,252,0.95) 100%)',
              border: '1px dashed rgba(148, 163, 184, 0.45)',
            }}
          >
            <GithubOutlined style={{ fontSize: 22, color: '#94a3b8', marginBottom: 8 }} />
            <div>
              <Text type="secondary">登录 GitHub 后即可发表评论</Text>
            </div>
          </div>
        )}
      </div>

      {commentLoading ? (
        <div style={{ textAlign: 'center', padding: '20px 0', color: '#999' }}>加载评论中...</div>
      ) : comments.length > 0 ? (
        <>
          <List
            itemLayout="horizontal"
            dataSource={comments}
            renderItem={(item) => {
              const u = item.user || item.author;
              const displayName = u?.nickname || u?.username || '匿名';
              const avatar = u?.avatar;
              const profileUrl = u?.htmlUrl;
              return (
                <List.Item
                  style={{
                    ...panelStyle,
                    padding: '12px 14px',
                    marginBottom: 10,
                  }}
                >
                  <List.Item.Meta
                    avatar={
                      profileUrl ? (
                        <a href={profileUrl} target="_blank" rel="noreferrer">
                          <Avatar
                            size={40}
                            src={avatar}
                            icon={<GithubOutlined />}
                            style={{ background: avatar ? undefined : `linear-gradient(135deg, ${primary}, #ffd7ea)` }}
                          />
                        </a>
                      ) : (
                        <Avatar
                          size={40}
                          src={avatar}
                          icon={<GithubOutlined />}
                          style={{ background: avatar ? undefined : `linear-gradient(135deg, ${primary}, #ffd7ea)` }}
                        />
                      )
                    }
                    title={(
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        {profileUrl ? (
                          <a href={profileUrl} target="_blank" rel="noreferrer" style={{ color: '#0f172a', fontWeight: 600 }}>
                            {displayName}
                          </a>
                        ) : (
                          <span style={{ color: '#0f172a', fontWeight: 600 }}>{displayName}</span>
                        )}
                        <Text style={{ color: '#9ca3af', fontSize: 13 }}>
                          <ClockCircleOutlined style={{ marginRight: 4 }} />
                          {dayjs(item.createdAt).format('YYYY-MM-DD HH:mm')}
                        </Text>
                      </div>
                    )}
                    description={(
                      <Paragraph style={{ marginBottom: 0, marginTop: 4, color: '#4b5563' }}>
                        {item.content}
                      </Paragraph>
                    )}
                  />
                </List.Item>
              );
            }}
          />
          {commentTotal > commentPageSize && (
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 16, paddingTop: 8 }}>
              <Pagination
                current={commentPage}
                total={commentTotal}
                pageSize={commentPageSize}
                showSizeChanger={false}
                onChange={(p) => {
                  setCommentPage(p);
                  loadComments(p);
                }}
              />
            </div>
          )}
        </>
      ) : (
        <Empty description="暂无评论，快来抢沙发吧！" />
      )}
    </div>
  );
}
