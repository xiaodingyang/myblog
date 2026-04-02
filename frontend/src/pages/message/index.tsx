import React, { useEffect, useState } from 'react';
import { Typography, Card, Input, Button, List, Avatar, Pagination, message } from 'antd';
import { MessageOutlined, ClockCircleOutlined, GithubOutlined } from '@ant-design/icons';
import { request, useModel } from 'umi';
import dayjs from 'dayjs';
import Empty from '@/components/Empty';
import MessageSkeleton from '@/components/Skeleton/MessageSkeleton';
import useSEO from '@/hooks/useSEO';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const MessagePage: React.FC = () => {
  useSEO({
    title: '留言板',
    description: '欢迎在若风的博客留言板留下你的想法、建议或问题。',
    keywords: '留言板,评论,交流,技术讨论',
  });
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [content, setContent] = useState('');
  const { githubUser, githubToken, isLoggedIn, requireAuth } = useModel('githubUserModel');
  const [pageSize, setPageSize] = useState(10);

  const fetchMessages = async (currentPage: number) => {
    setLoading(true);
    try {
      const res = await request<API.Response<API.PageResult<API.Message>>>('/api/messages', {
        params: { page: currentPage, pageSize },
      });
      if (res.code === 0) {
        setMessages(res.data.list);
        setTotal(res.data.total);
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages(page);
  }, [page, pageSize]);

  // Bug Fix #2: 确保在回调内部再次检查登录状态和 githubToken，防止竞态条件
  const handleSubmit = () => {
    requireAuth(async () => {
      // 二次检查：确保 githubToken 有效（防止 requireAuth 调用后 token 被清空的边缘情况）
      if (!isLoggedIn || !githubToken) {
        message.warning('请先登录后再发表留言');
        return;
      }
      if (!content.trim() || content.trim().length < 5) {
        message.warning('留言内容至少5个字符');
        return;
      }
      setSubmitting(true);
      try {
        const res = await request<API.Response<API.Message>>('/api/messages', {
          method: 'POST',
          headers: { Authorization: `Bearer ${githubToken}` },
          data: { content: content.trim() },
        });
        if (res.code === 0) {
          message.success('留言提交成功，等待审核后显示');
          setContent('');
        } else {
          message.error(res.message || '留言提交失败');
        }
      } catch (error) {
        message.error('留言提交失败');
      } finally {
        setSubmitting(false);
      }
    });
  };

  return (
    <div className="animate-fade-in py-8">
      <div className="max-w-6xl mx-auto px-4 md:px-6">
        {/* 页面标题 - 透明背景，显示粒子 */}
        <div className="text-center mb-12">
          <div
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
            style={{
              background: 'linear-gradient(135deg, #13c2c2 0%, #36cfc9 100%)',
            }}
          >
            <MessageOutlined className="text-3xl text-white" />
          </div>
          <Title 
            level={1} 
            className="!mb-3 !text-white"
            style={{
              textShadow: '0 2px 24px rgba(0, 0, 0, 0.45)',
            }}
          >
            留言板
          </Title>
          <Text 
            className="!text-white/85 text-lg"
            style={{
              textShadow: '0 1px 12px rgba(0, 0, 0, 0.35)',
            }}
          >
            欢迎留下你的足迹，共 {total} 条留言
          </Text>
        </div>

        {/* 内容区域 - 白色背景，覆盖粒子 */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-lg relative z-10">
        {/* 留言表单 */}
        <Card
          className="mb-8"
          style={{
            borderRadius: 16,
            border: 'none',
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
          }}
        >
          <Title 
            level={4} 
            className="!mb-6"
            style={{
              textShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            }}
          >
            ✍️ 发表留言
          </Title>

          {isLoggedIn ? (
            <div className="flex gap-3">
              <Avatar
                size={40}
                src={githubUser?.avatar}
                icon={<GithubOutlined />}
                style={{ flexShrink: 0 }}
              />
              <div className="flex-1">
                <TextArea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="写下你想说的话..."
                  rows={4}
                  showCount
                  maxLength={500}
                />
                <div className="flex items-center justify-between mt-8">
                  <Text type="secondary" className="text-sm">
                    以 <Text strong>{githubUser?.nickname || githubUser?.username}</Text> 的身份留言
                  </Text>
                  <Button type="primary" onClick={handleSubmit} loading={submitting} size="large">
                    提交留言
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div
              className="text-center py-8 rounded-xl cursor-pointer transition-all hover:shadow-md"
              style={{ background: '#f8f9fa', border: '1px dashed #d9d9d9' }}
              onClick={() => requireAuth()}
            >
              <GithubOutlined style={{ fontSize: 28, color: '#999', marginBottom: 8 }} />
              <div>
                <Text type="secondary">登录 GitHub 后即可发表留言</Text>
              </div>
              <Button type="link" style={{ marginTop: 4 }}>
                点击登录
              </Button>
            </div>
          )}
        </Card>
        {/* 留言列表 */}
        <Card
          style={{
            borderRadius: 16,
            border: 'none',
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
          }}
        >
          <Title level={4} className="!mb-6">
            💬 全部留言
          </Title>

          {loading ? (
            <MessageSkeleton />
          ) : messages.length > 0 ? (
            <>
              <List
                itemLayout="horizontal"
                dataSource={messages}
                renderItem={(item, index) => (
                  <List.Item
                    className="animate-slide-up !px-0"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <List.Item.Meta
                      avatar={
                        item.user?.avatar ? (
                          <a href={item.user?.htmlUrl} target="_blank" rel="noreferrer">
                            <Avatar size={48} src={item.user.avatar} />
                          </a>
                        ) : (
                          <Avatar
                            size={48}
                            style={{
                              background: `linear-gradient(135deg, hsl(${((item.nickname || '匿').charCodeAt(0) * 10) % 360}, 70%, 50%) 0%, hsl(${((item.nickname || '匿').charCodeAt(0) * 10 + 30) % 360}, 70%, 60%) 100%)`,
                            }}
                          >
                            {(item.nickname || '匿').charAt(0).toUpperCase()}
                          </Avatar>
                        )
                      }
                      title={
                        <div className="flex items-center gap-3">
                          <Text 
                            strong
                            style={{
                              textShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                            }}
                          >
                            {item.user?.nickname || item.user?.username || item.nickname || '匿名'}
                          </Text>
                          <Text 
                            className="text-gray-400 text-sm"
                            style={{
                              textShadow: '0 1px 2px rgba(0, 0, 0, 0.08)',
                            }}
                          >
                            <ClockCircleOutlined className="mr-1" />
                            {dayjs(item.createdAt).format('YYYY-MM-DD HH:mm')}
                          </Text>
                        </div>
                      }
                      description={
                        <Paragraph 
                          className="!mb-0 mt-2 text-gray-600"
                          style={{
                            textShadow: '0 1px 2px rgba(0, 0, 0, 0.08)',
                          }}
                        >
                          {item.content}
                        </Paragraph>
                      }
                    />
                  </List.Item>
                )}
              />

              {total > pageSize && (
                <div className="flex justify-center mt-6 pt-6 border-t border-gray-100">
                  <Pagination
                    current={page}
                    total={total}
                    pageSize={pageSize}
                    showSizeChanger
                    pageSizeOptions={['10', '20', '50']}
                    onChange={(p, size) => {
                      if (size !== pageSize) {
                        setPageSize(size);
                        setPage(1);
                      } else {
                        setPage(p);
                      }
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                  />
                </div>
              )}
            </>
          ) : (
            <Empty description="暂无留言，快来抢沙发吧！" />
          )}
        </Card>
        </div>
      </div>
    </div>
  );
};

export default MessagePage;
