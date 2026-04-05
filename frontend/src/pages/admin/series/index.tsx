import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, Space, message, Popconfirm, Card, Typography } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, OrderedListOutlined } from '@ant-design/icons';
import { request } from 'umi';

const { Title } = Typography;

interface SeriesItem {
  _id: string;
  title: string;
  description: string;
  cover: string;
  sortOrder: number;
  articleCount: number;
  createdAt: string;
}

const SeriesManagePage: React.FC = () => {
  const [series, setSeries] = useState<SeriesItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form] = Form.useForm();

  const fetchSeries = async () => {
    setLoading(true);
    try {
      const res = await request('/api/series');
      if (res.code === 0) setSeries(res.data || []);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchSeries(); }, []);

  const handleSubmit = async (values: any) => {
    try {
      if (editingId) {
        await request(`/api/series/${editingId}`, { method: 'PUT', data: values });
        message.success('更新成功');
      } else {
        await request('/api/series', { method: 'POST', data: values });
        message.success('创建成功');
      }
      setModalOpen(false);
      form.resetFields();
      setEditingId(null);
      fetchSeries();
    } catch {
      message.error('操作失败');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await request(`/api/series/${id}`, { method: 'DELETE' });
      message.success('删除成功');
      fetchSeries();
    } catch {
      message.error('删除失败');
    }
  };

  const openEdit = (item: SeriesItem) => {
    setEditingId(item._id);
    form.setFieldsValue(item);
    setModalOpen(true);
  };

  const openCreate = () => {
    setEditingId(null);
    form.resetFields();
    setModalOpen(true);
  };

  const columns = [
    { title: '标题', dataIndex: 'title', key: 'title' },
    { title: '描述', dataIndex: 'description', key: 'description', ellipsis: true },
    { title: '排序', dataIndex: 'sortOrder', key: 'sortOrder', width: 80 },
    { title: '文章数', dataIndex: 'articleCount', key: 'articleCount', width: 80 },
    {
      title: '操作', key: 'action', width: 160,
      render: (_: any, record: SeriesItem) => (
        <Space>
          <Button type="link" icon={<EditOutlined />} onClick={() => openEdit(record)}>编辑</Button>
          <Popconfirm title="确定删除？" onConfirm={() => handleDelete(record._id)}>
            <Button type="link" danger icon={<DeleteOutlined />}>删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Card>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>
          <OrderedListOutlined style={{ marginRight: 8 }} />系列管理
        </Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>新建系列</Button>
      </div>

      <Table
        columns={columns}
        dataSource={series}
        rowKey="_id"
        loading={loading}
        pagination={false}
      />

      <Modal
        title={editingId ? '编辑系列' : '新建系列'}
        open={modalOpen}
        onCancel={() => { setModalOpen(false); form.resetFields(); setEditingId(null); }}
        onOk={() => form.submit()}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="title" label="标题" rules={[{ required: true, message: '请输入标题' }]}>
            <Input maxLength={100} />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea maxLength={500} rows={3} />
          </Form.Item>
          <Form.Item name="cover" label="封面 URL">
            <Input placeholder="https://..." />
          </Form.Item>
          <Form.Item name="sortOrder" label="排序序号" initialValue={0}>
            <InputNumber min={0} />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default SeriesManagePage;
