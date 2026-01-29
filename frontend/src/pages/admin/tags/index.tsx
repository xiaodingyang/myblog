import React, { useEffect, useState } from 'react';
import {
  Typography,
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Popconfirm,
  message,
  Card,
  Tag,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, TagOutlined } from '@ant-design/icons';
import { request } from 'umi';
import dayjs from 'dayjs';
import type { ColumnsType } from 'antd/es/table';

const { Title, Text } = Typography;

const TagsPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [tags, setTags] = useState<API.Tag[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTag, setEditingTag] = useState<API.Tag | null>(null);
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);

  const fetchTags = async () => {
    setLoading(true);
    try {
      const res = await request<API.Response<API.Tag[]>>('/api/tags');
      if (res.code === 0) {
        setTags(res.data);
      }
    } catch (error) {
      message.error('获取标签列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTags();
  }, []);

  const handleAdd = () => {
    setEditingTag(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (tag: API.Tag) => {
    setEditingTag(tag);
    form.setFieldsValue({ name: tag.name });
    setModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await request<API.Response>(`/api/admin/tags/${id}`, {
        method: 'DELETE',
      });
      if (res.code === 0) {
        message.success('删除成功');
        fetchTags();
      } else {
        message.error(res.message || '删除失败');
      }
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);

      const url = editingTag
        ? `/api/admin/tags/${editingTag._id}`
        : '/api/admin/tags';
      const method = editingTag ? 'PUT' : 'POST';

      const res = await request<API.Response<API.Tag>>(url, {
        method,
        data: values,
      });

      if (res.code === 0) {
        message.success(editingTag ? '更新成功' : '创建成功');
        setModalVisible(false);
        fetchTags();
      } else {
        message.error(res.message || '操作失败');
      }
    } catch (error) {
      // 表单验证错误
    } finally {
      setSaving(false);
    }
  };

  // 生成随机颜色
  const getTagColor = (index: number) => {
    const colors = [
      'blue', 'green', 'purple', 'magenta', 'orange',
      'cyan', 'geekblue', 'lime', 'volcano', 'gold',
    ];
    return colors[index % colors.length];
  };

  const columns: ColumnsType<API.Tag> = [
    {
      title: '标签名称',
      dataIndex: 'name',
      key: 'name',
      render: (name, _, index) => (
        <Tag color={getTagColor(index)} icon={<TagOutlined />}>
          {name}
        </Tag>
      ),
    },
    {
      title: '文章数',
      dataIndex: 'articleCount',
      key: 'articleCount',
      width: 100,
      render: (count) => <Text>{count || 0}</Text>,
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (date) => dayjs(date).format('YYYY-MM-DD HH:mm'),
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
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个标签吗？"
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
      {/* 标题和新建按钮 */}
      <Card
        className="mb-4"
        style={{
          borderRadius: 12,
          border: 'none',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
        }}
        bodyStyle={{ padding: 16 }}
      >
        <div className="flex items-center justify-between">
          <Title level={4} className="!mb-0">
            标签管理
            <Text className="text-gray-400 text-base font-normal ml-3">共 {tags.length} 个标签</Text>
          </Title>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            新建标签
          </Button>
        </div>
      </Card>

      {/* 标签列表 */}
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
          dataSource={tags}
          rowKey="_id"
          loading={loading}
          pagination={false}
        />
      </Card>

      <Modal
        title={editingTag ? '编辑标签' : '新建标签'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        confirmLoading={saving}
        okText="保存"
        cancelText="取消"
      >
        <Form form={form} layout="vertical" className="mt-4">
          <Form.Item
            name="name"
            label="标签名称"
            rules={[
              { required: true, message: '请输入标签名称' },
              { max: 20, message: '标签名称不能超过20个字符' },
            ]}
          >
            <Input placeholder="请输入标签名称" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default TagsPage;
