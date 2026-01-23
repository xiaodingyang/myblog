import React, { useEffect, useState } from 'react';
import { Typography, Card, Form, Input, Button, List, Avatar, Pagination, message } from 'antd';
import { MessageOutlined, UserOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { request } from 'umi';
import dayjs from 'dayjs';
import Loading from '@/components/Loading';
import Empty from '@/components/Empty';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const MessagePage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<API.Message[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();
  const pageSize = 10;

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
      console.error('Failed to fetch messages:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages(page);
  }, [page]);

  const handleSubmit = async (values: { nickname: string; email: string; content: string }) => {
    setSubmitting(true);
    try {
      const res = await request<API.Response<API.Message>>('/api/messages', {
        method: 'POST',
        data: values,
      });
      if (res.code === 0) {
        message.success('留言提交成功，等待审核后显示');
        form.resetFields();
      } else {
        message.error(res.message || '留言提交失败');
      }
    } catch (error) {
      message.error('留言提交失败');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="animate-fade-in py-8">
      <div className="max-w-4xl mx-auto px-6">
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
          <Title level={1} className="!mb-3 !text-gray-800">
            留言板
          </Title>
          <Text className="text-gray-600 text-lg">
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
          <Title level={4} className="!mb-6">
            ✍️ 发表留言
          </Title>

          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Form.Item
                name="nickname"
                label="昵称"
                rules={[
                  { required: true, message: '请输入昵称' },
                  { max: 20, message: '昵称不能超过20个字符' },
                ]}
              >
                <Input placeholder="请输入昵称" size="large" prefix={<UserOutlined className="text-gray-400" />} />
              </Form.Item>
              <Form.Item
                name="email"
                label="邮箱"
                rules={[
                  { required: true, message: '请输入邮箱' },
                  { type: 'email', message: '请输入正确的邮箱格式' },
                ]}
              >
                <Input placeholder="请输入邮箱（不会公开）" size="large" />
              </Form.Item>
            </div>
            <Form.Item
              name="content"
              label="留言内容"
              rules={[
                { required: true, message: '请输入留言内容' },
                { min: 5, message: '留言内容至少5个字符' },
                { max: 500, message: '留言内容不能超过500个字符' },
              ]}
            >
              <TextArea
                placeholder="写下你想说的话..."
                rows={4}
                showCount
                maxLength={500}
              />
            </Form.Item>
            <Form.Item className="!mb-0">
              <Button type="primary" htmlType="submit" loading={submitting} size="large">
                提交留言
              </Button>
            </Form.Item>
          </Form>
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
            <Loading />
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
                        <Avatar
                          size={48}
                          style={{
                            background: `linear-gradient(135deg, hsl(${(item.nickname.charCodeAt(0) * 10) % 360}, 70%, 50%) 0%, hsl(${(item.nickname.charCodeAt(0) * 10 + 30) % 360}, 70%, 60%) 100%)`,
                          }}
                        >
                          {item.nickname.charAt(0).toUpperCase()}
                        </Avatar>
                      }
                      title={
                        <div className="flex items-center gap-3">
                          <Text strong>{item.nickname}</Text>
                          <Text className="text-gray-400 text-sm">
                            <ClockCircleOutlined className="mr-1" />
                            {dayjs(item.createdAt).format('YYYY-MM-DD HH:mm')}
                          </Text>
                        </div>
                      }
                      description={
                        <Paragraph className="!mb-0 mt-2 text-gray-600">
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
                    showSizeChanger={false}
                    onChange={(p) => {
                      setPage(p);
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
