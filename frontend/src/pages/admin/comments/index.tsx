import React, { useEffect, useState } from 'react';
import { Typography, Table, Avatar, Tag, Space, Button, Modal, message } from 'antd';
import { GithubOutlined, CheckCircleOutlined, CloseCircleOutlined, DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { request } from 'umi';
import dayjs from 'dayjs';

const { Title } = Typography;

const CommentsPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const fetchComments = async (p = page, ps = pageSize) => {
    setLoading(true);
    try {
      const res = await request('/api/admin/comments', {
        params: { page: p, pageSize: ps },
      });
      if (res.code === 0) {
        setComments(res.data.list);
        setTotal(res.data.total);
      }
    } catch {
      message.error('获取评论列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, []);

  const handleReview = async (id: string, status: 'approved' | 'rejected') => {
    try {
      const res = await request(`/api/admin/comments/${id}/review`, {
        method: 'PUT',
        data: { status },
      });
      if (res.code === 0) {
        message.success(status === 'approved' ? '已通过' : '已拒绝');
        fetchComments();
      }
    } catch {
      message.error('操作失败');
    }
  };

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: '确定删除该评论？',
      icon: <ExclamationCircleOutlined />,
      okText: '确定',
      okButtonProps: { danger: true },
      cancelText: '取消',
      onOk: async () => {
        try {
          const res = await request(`/api/admin/comments/${id}`, { method: 'DELETE' });
          if (res.code === 0) {
            message.success('删除成功');
            fetchComments();
          }
        } catch {
          message.error('删除失败');
        }
      },
    });
  };

  const columns = [
    {
      title: '用户',
      key: 'user',
      width: 180,
      render: (_: any, record: any) => (
        <Space>
          <Avatar size={32} src={record.user?.avatar} icon={<GithubOutlined />} />
          <span>{record.user?.nickname || record.user?.username || '未知'}</span>
        </Space>
      ),
    },
    {
      title: '文章',
      key: 'article',
      width: 200,
      ellipsis: true,
      render: (_: any, record: any) => record.articleId?.title || '-',
    },
    {
      title: '评论内容',
      dataIndex: 'content',
      key: 'content',
      ellipsis: true,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => {
        const map: Record<string, { color: string; text: string }> = {
          pending: { color: 'orange', text: '待审核' },
          approved: { color: 'green', text: '已通过' },
          rejected: { color: 'red', text: '已拒绝' },
        };
        const item = map[status] || { color: 'default', text: status };
        return <Tag color={item.color}>{item.text}</Tag>;
      },
    },
    {
      title: '时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 170,
      render: (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: '操作',
      key: 'action',
      width: 220,
      render: (_: any, record: any) => (
        <Space>
          {record.status === 'pending' && (
            <>
              <Button type="link" size="small" icon={<CheckCircleOutlined />} onClick={() => handleReview(record._id, 'approved')}>
                通过
              </Button>
              <Button type="link" size="small" danger icon={<CloseCircleOutlined />} onClick={() => handleReview(record._id, 'rejected')}>
                拒绝
              </Button>
            </>
          )}
          <Button type="link" size="small" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record._id)}>
            删除
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Title level={4} className="!mb-6">评论管理</Title>
      <Table
        columns={columns}
        dataSource={comments}
        rowKey="_id"
        loading={loading}
        pagination={{
          current: page,
          pageSize,
          total,
          showSizeChanger: true,
          showTotal: (t) => `共 ${t} 条评论`,
          onChange: (p, ps) => {
            setPage(p);
            setPageSize(ps);
            fetchComments(p, ps);
          },
        }}
      />
    </div>
  );
};

export default CommentsPage;
