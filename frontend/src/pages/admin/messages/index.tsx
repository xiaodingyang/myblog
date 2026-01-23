import React, { useEffect, useState } from 'react';
import {
  Typography,
  Table,
  Button,
  Space,
  Select,
  Popconfirm,
  message,
  Card,
  Tag,
  Avatar,
  Modal,
} from 'antd';
import {
  CheckOutlined,
  CloseOutlined,
  DeleteOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import { request } from 'umi';
import dayjs from 'dayjs';
import type { ColumnsType } from 'antd/es/table';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

const MessagesPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<API.Message[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [status, setStatus] = useState<string>('');
  const [previewMessage, setPreviewMessage] = useState<API.Message | null>(null);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const res = await request<API.Response<API.PageResult<API.Message>>>('/api/admin/messages', {
        params: {
          page,
          pageSize,
          status: status || undefined,
        },
      });
      if (res.code === 0) {
        setMessages(res.data.list);
        setTotal(res.data.total);
      }
    } catch (error) {
      message.error('获取留言列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [page, pageSize, status]);

  const handleReview = async (id: string, newStatus: 'approved' | 'rejected') => {
    try {
      const res = await request<API.Response>(`/api/admin/messages/${id}/review`, {
        method: 'PUT',
        data: { status: newStatus },
      });
      if (res.code === 0) {
        message.success(newStatus === 'approved' ? '审核通过' : '已拒绝');
        fetchMessages();
      } else {
        message.error(res.message || '操作失败');
      }
    } catch (error) {
      message.error('操作失败');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await request<API.Response>(`/api/admin/messages/${id}`, {
        method: 'DELETE',
      });
      if (res.code === 0) {
        message.success('删除成功');
        fetchMessages();
      } else {
        message.error(res.message || '删除失败');
      }
    } catch (error) {
      message.error('删除失败');
    }
  };

  const getStatusTag = (status: string) => {
    const statusMap: Record<string, { color: string; text: string }> = {
      pending: { color: 'orange', text: '待审核' },
      approved: { color: 'green', text: '已通过' },
      rejected: { color: 'red', text: '已拒绝' },
    };
    const item = statusMap[status] || { color: 'default', text: status };
    return <Tag color={item.color}>{item.text}</Tag>;
  };

  const columns: ColumnsType<API.Message> = [
    {
      title: '用户信息',
      key: 'user',
      width: 200,
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <Avatar
            style={{
              background: `linear-gradient(135deg, hsl(${(record.nickname.charCodeAt(0) * 10) % 360}, 70%, 50%) 0%, hsl(${(record.nickname.charCodeAt(0) * 10 + 30) % 360}, 70%, 60%) 100%)`,
            }}
          >
            {record.nickname.charAt(0).toUpperCase()}
          </Avatar>
          <div>
            <Text strong>{record.nickname}</Text>
            <Text className="block text-gray-400 text-xs">{record.email}</Text>
          </div>
        </div>
      ),
    },
    {
      title: '留言内容',
      dataIndex: 'content',
      key: 'content',
      ellipsis: true,
      render: (content) => (
        <Text className="text-gray-600" ellipsis style={{ maxWidth: 300 }}>
          {content}
        </Text>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => getStatusTag(status),
    },
    {
      title: '时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 160,
      render: (date) => dayjs(date).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => setPreviewMessage(record)}
          >
            查看
          </Button>
          {record.status === 'pending' && (
            <>
              <Button
                type="link"
                size="small"
                icon={<CheckOutlined />}
                onClick={() => handleReview(record._id, 'approved')}
                style={{ color: '#52c41a' }}
              >
                通过
              </Button>
              <Button
                type="link"
                size="small"
                icon={<CloseOutlined />}
                onClick={() => handleReview(record._id, 'rejected')}
                danger
              >
                拒绝
              </Button>
            </>
          )}
          <Popconfirm
            title="确定要删除这条留言吗？"
            onConfirm={() => handleDelete(record._id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <Title level={3} className="!mb-1">
            留言管理
          </Title>
          <Text className="text-gray-500">共 {total} 条留言</Text>
        </div>
        <Select
          placeholder="筛选状态"
          value={status || undefined}
          onChange={setStatus}
          style={{ width: 120 }}
          allowClear
        >
          <Option value="pending">待审核</Option>
          <Option value="approved">已通过</Option>
          <Option value="rejected">已拒绝</Option>
        </Select>
      </div>

      <Card
        style={{
          borderRadius: 12,
          border: 'none',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
        }}
        bodyStyle={{ padding: 0 }}
      >
        <Table
          columns={columns}
          dataSource={messages}
          rowKey="_id"
          loading={loading}
          pagination={{
            current: page,
            pageSize,
            total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条`,
            onChange: (p, ps) => {
              setPage(p);
              setPageSize(ps);
            },
          }}
        />
      </Card>

      {/* 留言详情弹窗 */}
      <Modal
        title="留言详情"
        open={!!previewMessage}
        onCancel={() => setPreviewMessage(null)}
        footer={[
          <Button key="close" onClick={() => setPreviewMessage(null)}>
            关闭
          </Button>,
          previewMessage?.status === 'pending' && (
            <Button
              key="approve"
              type="primary"
              onClick={() => {
                handleReview(previewMessage._id, 'approved');
                setPreviewMessage(null);
              }}
            >
              审核通过
            </Button>
          ),
        ]}
      >
        {previewMessage && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Avatar
                size={48}
                style={{
                  background: `linear-gradient(135deg, hsl(${(previewMessage.nickname.charCodeAt(0) * 10) % 360}, 70%, 50%) 0%, hsl(${(previewMessage.nickname.charCodeAt(0) * 10 + 30) % 360}, 70%, 60%) 100%)`,
                }}
              >
                {previewMessage.nickname.charAt(0).toUpperCase()}
              </Avatar>
              <div>
                <Text strong className="block">{previewMessage.nickname}</Text>
                <Text className="text-gray-400">{previewMessage.email}</Text>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Text className="text-gray-500">状态：</Text>
              {getStatusTag(previewMessage.status)}
            </div>
            <div>
              <Text className="text-gray-500">时间：</Text>
              <Text>{dayjs(previewMessage.createdAt).format('YYYY-MM-DD HH:mm:ss')}</Text>
            </div>
            <div>
              <Text className="text-gray-500 block mb-2">留言内容：</Text>
              <Card size="small" style={{ background: '#f8fafc' }}>
                <Paragraph className="!mb-0">{previewMessage.content}</Paragraph>
              </Card>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default MessagesPage;
