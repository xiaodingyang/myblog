import React, { useState, useEffect } from 'react';
import { useNavigate, useModel } from 'umi';
import { Form, Input, Button, Checkbox, message } from 'antd';
import { UserOutlined, LockOutlined, GithubOutlined, WechatOutlined } from '@ant-design/icons';
import { request } from 'umi';
import { getColorThemeById } from '@/config/colorThemes';
import AnimatedCharacters from '@/components/AnimatedCharacters';

const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { setInitialState } = useModel('@@initialState');
  const { themeId: colorThemeId } = useModel('colorModel');
  const [loading, setLoading] = useState(false);
  const currentColorTheme = getColorThemeById(colorThemeId);
  const [time, setTime] = useState(new Date());
  const [isTyping, setIsTyping] = useState(false);
  const [isPassword, setIsPassword] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/admin/dashboard');
    }
  }, [navigate]);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

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
      // Bug Fix #10: 添加更友好的错误提示，而不是依赖全局 errorHandler（用户体验更好）
      if (error?.response?.data?.message) {
        message.error(error.response.data.message);
      } else if (error.message) {
        message.error('登录失败：' + error.message);
      } else {
        message.error('网络错误，请检查网络连接后重试');
      }
    } finally {
      setLoading(false);
    }
  };

  const hexToRgb = (hex: string) => {
    const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return r ? { r: parseInt(r[1], 16), g: parseInt(r[2], 16), b: parseInt(r[3], 16) } : { r: 255, g: 179, b: 217 };
  };

  const rgb = hexToRgb(currentColorTheme.primary);
  const greeting = time.getHours() < 12 ? '早上好' : time.getHours() < 18 ? '下午好' : '晚上好';

  return (
    <div className="min-h-screen flex" style={{ background: '#f8fafc' }}>
      {/* 左侧动画面板 */}
      <div
        className="hidden lg:flex lg:w-[45%] xl:w-[42%] relative flex-col items-center justify-center overflow-hidden"
        style={{
          background: `linear-gradient(160deg, #0f172a 0%, rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.25) 50%, #1e293b 100%)`,
        }}
      >
        {/* 装饰光晕 */}
        <div
          className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full opacity-20 blur-3xl"
          style={{ background: currentColorTheme.primary }}
        />
        <div
          className="absolute bottom-[-15%] left-[-10%] w-[400px] h-[400px] rounded-full opacity-15 blur-3xl"
          style={{ background: currentColorTheme.primary }}
        />

        {/* 顶部 Logo */}
        <div className="absolute top-0 left-0 w-full z-10 p-8 lg:p-10">
          <div className="flex items-center gap-3">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg"
              style={{ backgroundImage: currentColorTheme.gradient }}
            >
              风
            </div>
            <span className="text-white/90 font-bold text-xl tracking-wide">若风的博客</span>
          </div>
        </div>

        {/* 动画角色 */}
        <div className="relative z-10">
          <AnimatedCharacters
            isTyping={isTyping}
            isPassword={isPassword}
            primaryColor={currentColorTheme.primary}
          />
        </div>

        {/* 品牌信息 */}
        <div className="relative z-10 mt-10 text-center px-10">
          <h2
            className="text-2xl xl:text-3xl font-bold mb-3"
            style={{
              background: `linear-gradient(135deg, #ffffff 0%, ${currentColorTheme.primary} 60%, #ffd700 100%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            记录技术，分享成长
          </h2>
          <p className="text-white/40 text-sm">
            专注 React / TypeScript / Node.js 的技术博客
          </p>
        </div>

        {/* 底部 */}
        <div className="absolute bottom-0 left-0 w-full z-10 p-8 lg:p-10">
          <div className="flex items-center gap-4 text-white/30 text-xs flex-wrap">
            <span>© {new Date().getFullYear()} 若风的博客</span>
            <span>·</span>
            <a
              href="https://github.com/xiaodingyang"
              target="_blank"
              rel="noreferrer"
              className="text-white/30 hover:text-white/60 transition-colors"
            >
              <GithubOutlined className="mr-1" />
              GitHub
            </a>
            <span>·</span>
            <a
              href="https://beian.miit.gov.cn/"
              target="_blank"
              rel="noreferrer"
              className="text-white/30 hover:text-white/60 transition-colors"
            >
              蜀ICP备2026005106号
            </a>
          </div>
        </div>
      </div>

      {/* 右侧登录表单 */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* 移动端顶部 Logo + 角色 */}
        <div className="lg:hidden flex flex-col items-center pt-8 pb-4">
          <div className="flex items-center gap-3 mb-6">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-lg"
              style={{ backgroundImage: currentColorTheme.gradient }}
            >
              风
            </div>
            <span className="font-bold text-lg text-gray-800">若风的博客</span>
          </div>
          <div style={{ transform: 'scale(0.7)', transformOrigin: 'center' }}>
            <AnimatedCharacters
              isTyping={isTyping}
              isPassword={isPassword}
              primaryColor={currentColorTheme.primary}
            />
          </div>
        </div>

        {/* 表单居中区域 */}
        <div className="flex-1 flex items-center justify-center px-6 sm:px-12 lg:px-16 xl:px-24">
          <div className="w-full max-w-[400px]">
            {/* 欢迎语 */}
            <div className="mb-8">
              <div className="text-sm font-medium text-gray-400 mb-2">{greeting}，管理员</div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                欢迎回来
              </h2>
              <p className="text-gray-400 text-sm">请输入你的账号信息以继续</p>
            </div>

            <Form
              name="login"
              size="large"
              onFinish={handleSubmit}
              autoComplete="off"
              initialValues={{ username: '', password: '', remember: true }}
              layout="vertical"
            >
              <Form.Item
                name="username"
                label={<span className="text-gray-600 font-medium text-sm">用户名</span>}
                rules={[{ required: true, message: '请输入用户名' }]}
              >
                <Input
                  prefix={<UserOutlined className="text-gray-300" />}
                  placeholder="请输入用户名"
                  onFocus={() => {
                    setIsTyping(true);
                    setIsPassword(false);
                  }}
                  onBlur={() => setIsTyping(false)}
                  style={{
                    borderRadius: 12,
                    height: 48,
                    borderColor: '#e2e8f0',
                  }}
                />
              </Form.Item>

              <Form.Item
                name="password"
                label={<span className="text-gray-600 font-medium text-sm">密码</span>}
                rules={[{ required: true, message: '请输入密码' }]}
              >
                <Input.Password
                  prefix={<LockOutlined className="text-gray-300" />}
                  placeholder="请输入密码"
                  onFocus={() => {
                    setIsPassword(true);
                    setIsTyping(false);
                  }}
                  onBlur={() => setIsPassword(false)}
                  style={{
                    borderRadius: 12,
                    height: 48,
                    borderColor: '#e2e8f0',
                  }}
                />
              </Form.Item>

              <div className="flex items-center justify-between mb-6">
                <Form.Item name="remember" valuePropName="checked" noStyle>
                  <Checkbox className="text-gray-500 text-sm">记住登录状态</Checkbox>
                </Form.Item>
              </div>

              <Form.Item className="!mb-4">
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  block
                  style={{
                    height: 48,
                    borderRadius: 12,
                    fontWeight: 600,
                    fontSize: 15,
                    border: 'none',
                    backgroundImage: currentColorTheme.gradient,
                    boxShadow: `0 4px 14px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.4)`,
                  }}
                >
                  登 录
                </Button>
              </Form.Item>
            </Form>
          </div>
        </div>

        {/* 底部 */}
        <div className="px-6 sm:px-12 lg:px-16 xl:px-24 py-6 text-center lg:text-left">
          <p className="text-xs text-gray-300">
            访问
            <a
              href="/"
              className="mx-1 hover:underline"
              style={{ color: currentColorTheme.primary }}
            >
              博客首页
            </a>
            浏览更多内容
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
