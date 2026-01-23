import React, { useEffect, useState } from 'react';
import { Link } from 'umi';
import { Typography, Row, Col, Card, Statistic, List, Tag, Space, Avatar } from 'antd';
import {
  FileTextOutlined,
  FolderOutlined,
  TagsOutlined,
  MessageOutlined,
  EyeOutlined,
  RiseOutlined,
  ClockCircleOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { request } from 'umi';
import dayjs from 'dayjs';
import Loading from '@/components/Loading';

const { Title, Text } = Typography;

interface DashboardData {
  statistics: API.Statistics;
  recentArticles: API.Article[];
  recentMessages: API.Message[];
}

const DashboardPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [statsRes, articlesRes, messagesRes] = await Promise.all([
          request<API.Response<API.Statistics>>('/api/admin/statistics'),
          request<API.Response<API.PageResult<API.Article>>>('/api/admin/articles', {
            params: { page: 1, pageSize: 5 },
          }),
          request<API.Response<API.PageResult<API.Message>>>('/api/admin/messages', {
            params: { page: 1, pageSize: 5, status: 'pending' },
          }),
        ]);

        setData({
          statistics: statsRes.code === 0 ? statsRes.data : {
            articleCount: 0,
            categoryCount: 0,
            tagCount: 0,
            messageCount: 0,
            totalViews: 0,
          },
          recentArticles: articlesRes.code === 0 ? articlesRes.data.list : [],
          recentMessages: messagesRes.code === 0 ? messagesRes.data.list : [],
        });
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <Loading />;
  }

  const stats = data?.statistics || {
    articleCount: 0,
    categoryCount: 0,
    tagCount: 0,
    messageCount: 0,
    totalViews: 0,
  };

  const statCards = [
    {
      title: '文章总数',
      value: stats.articleCount,
      icon: <FileTextOutlined />,
      color: '#1677ff',
      link: '/admin/articles',
    },
    {
      title: '分类数量',
      value: stats.categoryCount,
      icon: <FolderOutlined />,
      color: '#52c41a',
      link: '/admin/categories',
    },
    {
      title: '标签数量',
      value: stats.tagCount,
      icon: <TagsOutlined />,
      color: '#722ed1',
      link: '/admin/tags',
    },
    {
      title: '留言数量',
      value: stats.messageCount,
      icon: <MessageOutlined />,
      color: '#fa8c16',
      link: '/admin/messages',
    },
    {
      title: '总阅读量',
      value: stats.totalViews,
      icon: <EyeOutlined />,
      color: '#eb2f96',
      suffix: <RiseOutlined className="text-green-500" />,
    },
  ];

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <Title level={3} className="!mb-1">
          仪表盘
        </Title>
        <Text className="text-gray-500">
          欢迎回来，今天也要努力更新博客哦！
        </Text>
      </div>

      {/* 统计卡片 */}
      <Row gutter={[16, 16]} className="mb-6">
        {statCards.map((item, index) => (
          <Col xs={12} sm={8} lg={index < 4 ? 6 : 24} xl={index < 4 ? 6 : 6} key={item.title}>
            <Card
              hoverable={!!item.link}
              onClick={() => item.link && (window.location.href = item.link)}
              className="h-full"
              style={{
                borderRadius: 12,
                border: 'none',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
              }}
            >
              <div className="flex items-center justify-between">
                <Statistic
                  title={<Text className="text-gray-500">{item.title}</Text>}
                  value={item.value}
                  suffix={item.suffix}
                  valueStyle={{ color: item.color, fontWeight: 600 }}
                />
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-xl text-white"
                  style={{ background: item.color }}
                >
                  {item.icon}
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={[16, 16]}>
        {/* 最近文章 */}
        <Col xs={24} lg={14}>
          <Card
            title={
              <Space>
                <FileTextOutlined className="text-primary" />
                最近文章
              </Space>
            }
            extra={<Link to="/admin/articles">查看全部</Link>}
            style={{
              borderRadius: 12,
              border: 'none',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
            }}
          >
            <List
              itemLayout="horizontal"
              dataSource={data?.recentArticles || []}
              locale={{ emptyText: '暂无文章' }}
              renderItem={(article) => (
                <List.Item
                  actions={[
                    <Space key="views" className="text-gray-400">
                      <EyeOutlined />
                      {article.views}
                    </Space>,
                  ]}
                >
                  <List.Item.Meta
                    avatar={
                      article.cover ? (
                        <Avatar shape="square" size={48} src={article.cover} />
                      ) : (
                        <Avatar
                          shape="square"
                          size={48}
                          style={{ background: '#1677ff' }}
                        >
                          {article.title.charAt(0)}
                        </Avatar>
                      )
                    }
                    title={
                      <Link to={`/admin/articles/edit/${article._id}`}>
                        <Text strong ellipsis className="hover:text-primary">
                          {article.title}
                        </Text>
                      </Link>
                    }
                    description={
                      <Space>
                        <Tag color={article.status === 'published' ? 'green' : 'orange'}>
                          {article.status === 'published' ? '已发布' : '草稿'}
                        </Tag>
                        <Text className="text-gray-400 text-xs">
                          <ClockCircleOutlined className="mr-1" />
                          {dayjs(article.createdAt).format('MM-DD HH:mm')}
                        </Text>
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>

        {/* 待审核留言 */}
        <Col xs={24} lg={10}>
          <Card
            title={
              <Space>
                <MessageOutlined style={{ color: '#fa8c16' }} />
                待审核留言
              </Space>
            }
            extra={<Link to="/admin/messages">查看全部</Link>}
            style={{
              borderRadius: 12,
              border: 'none',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
            }}
          >
            <List
              itemLayout="horizontal"
              dataSource={data?.recentMessages || []}
              locale={{ emptyText: '暂无待审核留言' }}
              renderItem={(msg) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      <Avatar
                        style={{
                          background: `linear-gradient(135deg, hsl(${(msg.nickname.charCodeAt(0) * 10) % 360}, 70%, 50%) 0%, hsl(${(msg.nickname.charCodeAt(0) * 10 + 30) % 360}, 70%, 60%) 100%)`,
                        }}
                      >
                        {msg.nickname.charAt(0).toUpperCase()}
                      </Avatar>
                    }
                    title={
                      <div className="flex items-center gap-2">
                        <Text strong>{msg.nickname}</Text>
                        <Tag color="orange">待审核</Tag>
                      </div>
                    }
                    description={
                      <Text ellipsis className="text-gray-500">
                        {msg.content}
                      </Text>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DashboardPage;
