import React, { useTransition } from 'react';
import { Form, Input, Button, message, Avatar, Typography } from 'antd';
import { GithubOutlined } from '@ant-design/icons';

const { TextArea } = Input;
const { Text } = Typography;

interface CommentFormProps {
  onSubmit: (content: string) => Promise<void>;
  token?: string;
  username?: string;
}

export default function CommentForm({ onSubmit, token, username }: CommentFormProps) {
  const [form] = Form.useForm();
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (values: { content: string }) => {
    if (!values.content.trim() || values.content.trim().length < 2) {
      message.warning('评论内容至少2个字符');
      return;
    }

    startTransition(async () => {
      try {
        await onSubmit(values.content.trim());
        message.success('评论发表成功');
        form.resetFields();
      } catch (error: any) {
        message.error(error.message || '评论发表失败');
      }
    });
  };

  if (!token || !username) {
    return (
      <div
        style={{
          textAlign: 'center',
          padding: '24px 16px',
          borderRadius: 12,
          background: '#f8f9fa',
          border: '1px dashed #d9d9d9',
        }}
      >
        <GithubOutlined style={{ fontSize: 24, color: '#999', marginBottom: 8 }} />
        <div>
          <Text type="secondary">登录 GitHub 后即可发表评论</Text>
        </div>
      </div>
    );
  }

  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ display: 'flex', gap: 12 }}>
        <Avatar size={40} icon={<GithubOutlined />} style={{ flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <Form form={form} onFinish={handleSubmit}>
            <Form.Item name="content" rules={[{ required: true, message: '请输入评论内容' }]}>
              <TextArea
                rows={3}
                placeholder="写下你的评论..."
                maxLength={500}
                showCount
                disabled={isPending}
              />
            </Form.Item>
            <Form.Item style={{ marginBottom: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text type="secondary" style={{ fontSize: 14 }}>
                  以 <Text strong>{username}</Text> 的身份评论
                </Text>
                <Button type="primary" htmlType="submit" loading={isPending}>
                  {isPending ? '发表中...' : '发表评论'}
                </Button>
              </div>
            </Form.Item>
          </Form>
        </div>
      </div>
    </div>
  );
}
