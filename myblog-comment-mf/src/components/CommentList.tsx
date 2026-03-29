import { use, Suspense } from 'react';
import { List, Avatar, Typography, Spin } from 'antd';
import { GithubOutlined, ClockCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import type { Comment } from '@/types/comment';

const { Text, Paragraph } = Typography;

interface CommentListProps {
  commentsPromise: Promise<Comment[]>;
  optimisticComments?: Comment[];
}

function CommentListContent({ commentsPromise, optimisticComments }: CommentListProps) {
  const fetchedComments = use(commentsPromise);
  const comments = optimisticComments ?? fetchedComments;

  if (!comments.length) {
    return (
      <div style={{ padding: '20px 0' }}>
        <List locale={{ emptyText: '暂无评论，快来抢沙发吧！' }} dataSource={[]} />
      </div>
    );
  }

  return (
    <List
      itemLayout="horizontal"
      dataSource={comments}
      renderItem={(item) => {
        const u = item.user || item.author;
        const displayName = u?.nickname || u?.username || '匿名';
        const avatar = u?.avatar;
        const profileUrl = u?.htmlUrl;

        return (
          <List.Item style={{ paddingLeft: 0, paddingRight: 0, opacity: item.pending ? 0.6 : 1 }}>
            <List.Item.Meta
              avatar={
                profileUrl ? (
                  <a href={profileUrl} target="_blank" rel="noreferrer">
                    <Avatar size={40} src={avatar} icon={<GithubOutlined />} />
                  </a>
                ) : (
                  <Avatar size={40} src={avatar} icon={<GithubOutlined />} />
                )
              }
              title={
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  {profileUrl ? (
                    <a
                      href={profileUrl}
                      target="_blank"
                      rel="noreferrer"
                      style={{ color: '#1f2937', fontWeight: 500 }}
                    >
                      {displayName}
                    </a>
                  ) : (
                    <span style={{ color: '#1f2937', fontWeight: 500 }}>{displayName}</span>
                  )}
                  <Text style={{ color: '#9ca3af', fontSize: 13 }}>
                    <ClockCircleOutlined style={{ marginRight: 4 }} />
                    {item.pending ? '发送中...' : dayjs(item.createdAt).format('YYYY-MM-DD HH:mm')}
                  </Text>
                  {item.pending && <Text type="secondary">(发送中...)</Text>}
                </div>
              }
              description={
                <Paragraph style={{ marginBottom: 0, marginTop: 4, color: '#4b5563' }}>
                  {item.content}
                </Paragraph>
              }
            />
          </List.Item>
        );
      }}
    />
  );
}

export default function CommentList(props: CommentListProps) {
  return (
    <Suspense fallback={<Spin tip="加载评论中..." />}>
      <CommentListContent {...props} />
    </Suspense>
  );
}
