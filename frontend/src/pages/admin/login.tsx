import React, { useState, useEffect } from 'react';
import { useNavigate, useModel } from 'umi';
import { Form, Input, Button, Card, Typography, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { request } from 'umi';
import { getColorThemeById } from '@/config/colorThemes';
import ParticleThemeSelector from '@/components/ParticleThemeSelector';
import ParticlesBackground from '@/components/ParticlesBackground';

const { Title, Text } = Typography;

const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { setInitialState } = useModel('@@initialState');
  const { themeId: colorThemeId } = useModel('colorModel');
  const [loading, setLoading] = useState(false);
  const currentColorTheme = getColorThemeById(colorThemeId);

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
      // 错误已由全局 errorHandler 处理，这里不再重复提示
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
      }}
    >
      {/* 粒子背景 */}
      <ParticlesBackground isDark />

      <Card
        className="w-full max-w-md relative z-10"
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
              background: currentColorTheme.gradient,
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
              className="!h-12 !rounded-xl !font-medium !border-0"
              style={{
                backgroundImage: currentColorTheme.gradient,
              }}
            >
              登 录
            </Button>
          </Form.Item>
        </Form>
      </Card>

      {/* 主题选择器 */}
      <ParticleThemeSelector isDark />
    </div>
  );
};

export default AdminLoginPage;
