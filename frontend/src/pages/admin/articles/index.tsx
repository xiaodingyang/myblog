import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'umi';
import {
  Typography,
  Table,
  Button,
  Input,
  Select,
  Space,
  Tag,
  Avatar,
  Popconfirm,
  message,
  Card,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import { request } from 'umi';
import dayjs from 'dayjs';
import type { ColumnsType } from 'antd/es/table';

const { Title, Text } = Typography;
const { Option } = Select;

const ArticlesPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [articles, setArticles] = useState<API.Article[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [status, setStatus] = useState<string>('');
  const [categories, setCategories] = useState<API.Category[]>([]);

  const fetchArticles = async () => {
    setLoading(true);
    try {
      const res = await request<API.Response<API.PageResult<API.Article>>>('/api/admin/articles', {
        params: {
          page,
          pageSize,
          keyword: keyword || undefined,
          status: status || undefined,
        },
      });
      if (res.code === 0) {
        setArticles(res.data.list);
        setTotal(res.data.total);
      }
    } catch (error) {
      message.error('获取文章列表失败');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await request<API.Response<API.Category[]>>('/api/categories');
      if (res.code === 0) {
        setCategories(res.data);
      }
    } catch (error) {
      // ignore
    }
  };

  useEffect(() => {
    fetchArticles();
    fetchCategories();
  }, [page, pageSize, status]);

  const handleSearch = () => {
    setPage(1);
    fetchArticles();
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await request<API.Response>(`/api/admin/articles/${id}`, {
        method: 'DELETE',
      });
      if (res.code === 0) {
        message.success('删除成功');
        fetchArticles();
      } else {
        message.error(res.message || '删除失败');
      }
    } catch (error) {
      message.error('删除失败');
    }
  };

  const columns: ColumnsType<API.Article> = [
    {
      title: '文章',
      dataIndex: 'title',
      key: 'title',
      render: (_, record) => (
        <div className="flex items-center gap-3">
          {record.cover ? (
            <Avatar shape="square" size={48} src={record.cover} />
          ) : (
            <Avatar shape="square" size={48} style={{ background: '#1677ff' }}>
              {record.title.charAt(0)}
            </Avatar>
          )}
          <div>
            <Text strong className="block" ellipsis style={{ maxWidth: 200 }}>
              {record.title}
            </Text>
            <Text className="text-gray-400 text-xs">
              {dayjs(record.createdAt).format('YYYY-MM-DD HH:mm')}
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      width: 120,
      render: (category) => (
        <Tag color="blue">{category?.name || '未分类'}</Tag>
      ),
    },
    {
      title: '标签',
      dataIndex: 'tags',
      key: 'tags',
      width: 200,
      render: (tags: API.Tag[]) => (
        <Space wrap size={[4, 4]}>
          {tags?.slice(0, 2).map(tag => (
            <Tag key={tag._id}>{tag.name}</Tag>
          ))}
          {tags?.length > 2 && <Tag>+{tags.length - 2}</Tag>}
        </Space>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => (
        <Tag color={status === 'published' ? 'green' : 'orange'}>
          {status === 'published' ? '已发布' : '草稿'}
        </Tag>
      ),
    },
    {
      title: '阅读量',
      dataIndex: 'views',
      key: 'views',
      width: 100,
      render: (views) => (
        <Space>
          <EyeOutlined className="text-gray-400" />
          {views || 0}
        </Space>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => window.open(`/article/${record._id}`, '_blank')}
          >
            预览
          </Button>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => navigate(`/admin/articles/edit/${record._id}`)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这篇文章吗？"
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
            文章管理
          </Title>
          <Text className="text-gray-500">
            共 {total} 篇文章
          </Text>
        </div>
        <Link to="/admin/articles/create">
          <Button type="primary" icon={<PlusOutlined />}>
            新建文章
          </Button>
        </Link>
      </div>

      {/* 搜索筛选 */}
      <Card
        className="mb-4"
        style={{
          borderRadius: 12,
          border: 'none',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
        }}
        bodyStyle={{ padding: 16 }}
      >
        <Space wrap>
          <Input
            placeholder="搜索文章标题"
            prefix={<SearchOutlined className="text-gray-400" />}
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onPressEnter={handleSearch}
            style={{ width: 200 }}
            allowClear
          />
          <Select
            placeholder="文章状态"
            value={status || undefined}
            onChange={setStatus}
            style={{ width: 120 }}
            allowClear
          >
            <Option value="published">已发布</Option>
            <Option value="draft">草稿</Option>
          </Select>
          <Button type="primary" onClick={handleSearch}>
            搜索
          </Button>
        </Space>
      </Card>

      {/* 文章列表 */}
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
          dataSource={articles}
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
    </div>
  );
};

export default ArticlesPage;
