import React, { useState, useEffect } from 'react';
import { useNavigate, useModel } from 'umi';
import { Form, Input, Button, Card, Typography, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { request } from 'umi';

const { Title, Text } = Typography;

const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { setInitialState } = useModel('@@initialState');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // 如果已登录，跳转到后台首页
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/admin/dashboard');
    }
  }, [navigate]);

  const handleSubmit = async (values: { username: string; password: string }) => {
    setLoading(true);
    try {
      const res = await request<API.Response<{ token: string; user: API.User }>>('/api/auth/login', {
        method: 'POST',
        data: values,
      });

      if (res.code === 0) {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        setInitialState({
          currentUser: res.data.user,
          token: res.data.token,
        });
        message.success('登录成功');
        navigate('/admin/dashboard');
      } else {
        message.error(res.message || '登录失败');
      }
    } catch (error: any) {
      message.error(error.message || '登录失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
      }}
    >
      {/* 装饰背景 */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <Card
        className="w-full max-w-md relative"
        style={{
          borderRadius: 24,
          border: 'none',
          boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.25)',
        }}
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div
            className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center text-white font-bold text-2xl"
            style={{
              background: 'linear-gradient(135deg, #1677ff 0%, #722ed1 100%)',
            }}
          >
            B
          </div>
          <Title level={2} className="!mb-2">
            博客后台
          </Title>
          <Text className="text-gray-500">
            请登录以继续管理您的博客
          </Text>
        </div>

        <Form
          name="login"
          size="large"
          onFinish={handleSubmit}
          autoComplete="off"
          initialValues={{ username: '', password: '' }}
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input
              prefix={<UserOutlined className="text-gray-400" />}
              placeholder="用户名"
              className="!rounded-xl !h-12"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password
              prefix={<LockOutlined className="text-gray-400" />}
              placeholder="密码"
              className="!rounded-xl !h-12"
            />
          </Form.Item>

          <Form.Item className="!mb-4">
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              className="!h-12 !rounded-xl !font-medium"
            >
              登 录
            </Button>
          </Form.Item>
        </Form>

        <div className="text-center">
          <Text className="text-gray-400 text-sm">
            默认账号：admin / admin123
          </Text>
        </div>
      </Card>
    </div>
  );
};

export default AdminLoginPage;
