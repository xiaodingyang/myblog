import React, { useEffect, useState } from 'react';
import { Card, Avatar, Typography, Spin, List, Tag, Space } from 'antd';
import { TrophyOutlined, CommentOutlined } from '@ant-design/icons';
import useSEO from '@/hooks/useSEO';

const { Title, Text } = Typography;

interface RankUser {
  rank: number;
  userId: string;
  username: string;
  nickname: string;
  avatar: string;
  htmlUrl: string;
  commentCount: number;
  latestCommentTime: string;
}

const getRankIcon = (rank: number) => {
  if (rank === 1) return '🥇';
  if (rank === 2) return '🥈';
  if (rank === 3) return '🥉';
  return null;
};

const getRankTag = (rank: number) => {
  if (rank === 1) return <Tag color="gold" style={{ fontSize: 14 }}>🥇 金冠</Tag>;
  if (rank === 2) return <Tag color="silver" style={{ fontSize: 14 }}>🥈 银冠</Tag>;
  if (rank === 3) return <Tag color="#cd7f32" style={{ fontSize: 14 }}>🥉 铜冠</Tag>;
  return <Tag color="blue">#{rank}</Tag>;
};

const Rankings: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [list, setList] = useState<RankUser[]>([]);

  useSEO({ title: '🏆 评论活跃榜 - 我的博客' });

  useEffect(() => {
    fetch('/api/rankings/comments?limit=20')
      .then(res => res.json())
      .then(data => {
        if (data.code === 0) {
          setList(data.data || []);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 60 }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '24px 16px' }}>
      <Card
        title={
          <Space>
            <TrophyOutlined style={{ color: '#faad14' }} />
            <span>评论活跃榜</span>
          </Space>
        }
        style={{ borderRadius: 12 }}
      >
        <List
          dataSource={list}
          renderItem={(item) => (
            <List.Item
              style={{
                padding: '12px 8px',
                background: item.rank <= 3 ? 'rgba(250, 173, 20, 0.08)' : 'transparent',
                borderRadius: 8,
                marginBottom: 4,
              }}
            >
              <List.Item.Meta
                avatar={
                  <div style={{ position: 'relative', width: 56, textAlign: 'center' }}>
                    {item.rank <= 3 && (
                      <div style={{ fontSize: 20, position: 'absolute', top: -8, left: '50%', transform: 'translateX(-50%)' }}>
                        {getRankIcon(item.rank)}
                      </div>
                    )}
                    <Avatar
                      src={item.avatar}
                      size={item.rank <= 3 ? 52 : 44}
                      style={{ marginTop: item.rank <= 3 ? 8 : 0 }}
                    />
                  </div>
                }
                title={
                  <Space>
                    <a href={item.htmlUrl || `#/user/${item.username}`} target="_blank" rel="noopener noreferrer">
                      {item.nickname || item.username}
                    </a>
                    {getRankTag(item.rank)}
                  </Space>
                }
                description={
                  <Space size="large">
                    <Text type="secondary">
                      <CommentOutlined /> {item.commentCount} 条评论
                    </Text>
                    {item.latestCommentTime && (
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        最近：{new Date(item.latestCommentTime).toLocaleDateString('zh-CN')}
                      </Text>
                    )}
                  </Space>
                }
              />
            </List.Item>
          )}
        />
        {list.length === 0 && (
          <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>
            暂无数据，快来抢沙发吧！💪
          </div>
        )}
      </Card>
    </div>
  );
};

export default Rankings;
