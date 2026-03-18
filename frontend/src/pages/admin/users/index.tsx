import React, { useEffect, useState } from 'react';
import { Typography, Table, Avatar, Tag, Space, Button, Input, Modal, message } from 'antd';
import { GithubOutlined, SearchOutlined, StopOutlined, CheckCircleOutlined, DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { request } from 'umi';
import dayjs from 'dayjs';

const { Title } = Typography;

interface GithubUser {
  _id: string;
  githubId: number;
  username: string;
  nickname: string;
  avatar: string;
  email: string;
  htmlUrl: string;
  status: 'active' | 'banned';
  lastLoginAt: string;
  createdAt: string;
}

const UsersPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<GithubUser[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');

  const fetchUsers = async (p = page, ps = pageSize, kw = keyword) => {
    setLoading(true);
    try {
      const res = await request('/api/admin/users', {
        params: { page: p, pageSize: ps, keyword: kw || undefined },
      });
      if (res.code === 0) {
        setUsers(res.data.list);
        setTotal(res.data.total);
      }
    } catch {
      message.error('获取用户列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSearch = () => {
    setPage(1);
    fetchUsers(1, pageSize, keyword);
  };

  const handleToggleStatus = async (record: GithubUser) => {
    const newStatus = record.status === 'active' ? 'banned' : 'active';
    const action = newStatus === 'banned' ? '封禁' : '解封';

    Modal.confirm({
      title: `确定${action}用户 ${record.nickname || record.username}？`,
      icon: <ExclamationCircleOutlined />,
      content: newStatus === 'banned' ? '封禁后该用户将无法评论和留言' : '解封后该用户将恢复正常使用',
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        try {
          const res = await request(`/api/admin/users/${record._id}/status`, {
            method: 'PUT',
            data: { status: newStatus },
          });
          if (res.code === 0) {
            message.success(`${action}成功`);
            fetchUsers();
          } else {
            message.error(res.message || `${action}失败`);
          }
        } catch {
          message.error(`${action}失败`);
        }
      },
    });
  };

  const handleDelete = (record: GithubUser) => {
    Modal.confirm({
      title: `确定删除用户 ${record.nickname || record.username}？`,
      icon: <ExclamationCircleOutlined />,
      content: '删除后该用户的所有评论也将被删除，此操作不可恢复',
      okText: '确定删除',
      okButtonProps: { danger: true },
      cancelText: '取消',
      onOk: async () => {
        try {
          const res = await request(`/api/admin/users/${record._id}`, {
            method: 'DELETE',
          });
          if (res.code === 0) {
            message.success('删除成功');
            fetchUsers();
          } else {
            message.error(res.message || '删除失败');
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
      render: (_: any, record: GithubUser) => (
        <Space>
          <Avatar size={40} src={record.avatar} icon={<GithubOutlined />} />
          <div>
            <div className="font-medium">
              <a href={record.htmlUrl} target="_blank" rel="noreferrer" className="text-gray-800 hover:text-blue-500">
                {record.nickname || record.username}
              </a>
            </div>
            <div className="text-gray-400 text-xs">@{record.username}</div>
          </div>
        </Space>
      ),
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
      render: (email: string) => email || '-',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => (
        <Tag color={status === 'active' ? 'green' : 'red'}>
          {status === 'active' ? '正常' : '已封禁'}
        </Tag>
      ),
    },
    {
      title: '注册时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 170,
      render: (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: '最后登录',
      dataIndex: 'lastLoginAt',
      key: 'lastLoginAt',
      width: 170,
      render: (date: string) => date ? dayjs(date).format('YYYY-MM-DD HH:mm') : '-',
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      render: (_: any, record: GithubUser) => (
        <Space>
          <Button
            type="link"
            size="small"
            icon={record.status === 'active' ? <StopOutlined /> : <CheckCircleOutlined />}
            danger={record.status === 'active'}
            onClick={() => handleToggleStatus(record)}
          >
            {record.status === 'active' ? '封禁' : '解封'}
          </Button>
          <Button
            type="link"
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <Title level={4} className="!mb-0">用户管理</Title>
        <Space>
          <Input
            placeholder="搜索用户名/昵称"
            prefix={<SearchOutlined />}
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onPressEnter={handleSearch}
            style={{ width: 240 }}
            allowClear
          />
          <Button type="primary" onClick={handleSearch}>
            搜索
          </Button>
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={users}
        rowKey="_id"
        loading={loading}
        pagination={{
          current: page,
          pageSize,
          total,
          showSizeChanger: true,
          showTotal: (t) => `共 ${t} 位用户`,
          onChange: (p, ps) => {
            setPage(p);
            setPageSize(ps);
            fetchUsers(p, ps);
          },
        }}
      />
    </div>
  );
};

export default UsersPage;
