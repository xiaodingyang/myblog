import React, { useState, useEffect } from 'react';
import { useNavigate, useModel } from 'umi';
import { Form, Input, Button, Checkbox, ConfigProvider, message } from 'antd';
import { UserOutlined, LockOutlined, GithubOutlined } from '@ant-design/icons';
import { request } from 'umi';
import { ParticlesBackground } from '@xdy-npm/react-particle-backgrounds';
import { getColorThemeById, type ColorTheme } from '@/config/colorThemes';
import AnimatedCharacters from '@/components/AnimatedCharacters';

/** 与 global.css 一致，避免登录卡内回退成生硬的系统默认字体 */
const UI_FONT =
  "'Source Han Sans SC', 'Noto Sans SC', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

/** 表单与动效状态放此子树，避免 input 焦点切换时连带重绘全屏粒子背景导致闪白 */
const AdminLoginLayout: React.FC<{ currentColorTheme: ColorTheme }> = ({ currentColorTheme }) => {
  const navigate = useNavigate();
  const { setInitialState } = useModel('@@initialState');
  const [loading, setLoading] = useState(false);
  const [time, setTime] = useState(new Date());
  const [isTyping, setIsTyping] = useState(false);
  const [isPassword, setIsPassword] = useState(false);

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

  const blendRgb = (
    from: { r: number; g: number; b: number },
    to: { r: number; g: number; b: number },
    weightFrom: number,
  ) => {
    const w = Math.min(1, Math.max(0, weightFrom));
    return {
      r: Math.round(from.r * w + to.r * (1 - w)),
      g: Math.round(from.g * w + to.g * (1 - w)),
      b: Math.round(from.b * w + to.b * (1 - w)),
    };
  };
  const rgbCss = (c: { r: number; g: number; b: number }) => `rgb(${c.r}, ${c.g}, ${c.b})`;

  const rgb = hexToRgb(currentColorTheme.primary);
  /** 深色毛玻璃卡片：以白字为主，主题色做渐变强调与点缀 */
  const loginText = {
    greeting: 'rgba(255, 255, 255, 0.78)',
    sub: 'rgba(255, 255, 255, 0.58)',
    /** 表单项标签（深色底上） */
    label: 'rgba(255, 255, 255, 0.92)',
    /** 输入框内文字（浅底） */
    body: rgbCss(blendRgb(rgb, { r: 30, g: 41, b: 59 }, 0.22)),
    hint: rgbCss(blendRgb(rgb, { r: 148, g: 163, b: 184 }, 0.18)),
    muted: 'rgba(255, 255, 255, 0.72)',
    border: 'rgba(255, 255, 255, 0.14)',
    borderHover: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.55)`,
    inputBorder: 'rgba(255, 255, 255, 0.28)',
    inputBorderHover: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.45)`,
    iconInInput: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.5)`,
    titleGradient: `linear-gradient(135deg, #ffffff 0%, rgba(255, 255, 255, 0.96) 35%, ${currentColorTheme.primary} 100%)`,
  };
  const greeting = time.getHours() < 12 ? '早上好' : time.getHours() < 18 ? '下午好' : '晚上好';
  // 整页统一罩层（左右同一套渐变，避免中间色差接缝）
  const unifiedOverlay = `linear-gradient(160deg, rgba(15, 23, 42, 0.55) 0%, rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.2) 50%, rgba(30, 41, 59, 0.65) 100%)`;

  return (
    <div className="relative z-[1] h-full min-h-0 w-full flex overflow-hidden">
      <div className="pointer-events-none absolute inset-0 z-0" style={{ background: unifiedOverlay }} />
      {/* 全页光晕（相对整屏定位，避免只在左栏内 + overflow 裁剪造成垂直接缝） */}
      <div
        className="pointer-events-none absolute -top-[14%] left-[-12%] z-[1] h-[min(88vh,900px)] w-[min(145vw,1680px)] rounded-full opacity-[0.22] blur-[120px]"
        style={{ background: currentColorTheme.primary }}
      />
      <div
        className="pointer-events-none absolute -bottom-[22%] right-[-14%] z-[1] h-[min(62vh,640px)] w-[min(95vw,960px)] rounded-full opacity-[0.14] blur-[100px]"
        style={{ background: currentColorTheme.primary }}
      />
      {/* 左侧动画面板 */}
      <div className="relative z-[2] hidden lg:flex lg:w-[45%] xl:w-[42%] flex-col items-center justify-center min-w-0 min-h-0 h-full overflow-hidden bg-transparent">
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

      {/* 右侧 */}
      <div className="relative z-[2] flex-1 flex flex-col min-h-0 h-full min-w-0 overflow-hidden bg-transparent">
        {/* 移动端顶部 Logo + 角色 */}
        <div className="lg:hidden flex flex-col items-center shrink-0 pt-5 pb-2 sm:pt-6 sm:pb-3">
          <div className="flex items-center gap-3 mb-6">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-lg"
              style={{ backgroundImage: currentColorTheme.gradient }}
            >
              风
            </div>
            <span className="font-bold text-lg text-white drop-shadow-md">若风的博客</span>
          </div>
          <div style={{ transform: 'scale(0.7)', transformOrigin: 'center' }}>
            <AnimatedCharacters
              isTyping={isTyping}
              isPassword={isPassword}
              primaryColor={currentColorTheme.primary}
            />
          </div>
        </div>

        {/* 表单居中区域（min-h-0 避免 flex 子项撑出整页滚动） */}
        <div className="flex-1 min-h-0 flex items-center justify-center px-6 sm:px-12 lg:px-16 xl:px-24 overflow-hidden">
          <div
            className="admin-login-card w-full max-w-[400px] rounded-2xl px-6 py-8 sm:px-9 antialiased border border-white/20 shadow-[0_8px_40px_rgba(0,0,0,0.35)]"
            style={{
              fontFamily: UI_FONT,
              background: `linear-gradient(165deg, rgba(15, 23, 42, 0.72) 0%, rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.12) 48%, rgba(15, 23, 42, 0.78) 100%)`,
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
            }}
          >
            <div className="mb-9 space-y-2">
              <div
                className="text-[15px] font-medium tracking-wide"
                style={{ color: loginText.greeting, textShadow: `0 0 24px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.35)` }}
              >
                {greeting}，管理员
              </div>
              <h2
                className="text-[1.65rem] sm:text-[1.85rem] font-semibold tracking-tight leading-snug"
                style={{
                  background: loginText.titleGradient,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                欢迎回来
              </h2>
              <p className="text-[15px] leading-relaxed" style={{ color: loginText.sub }}>
                请输入你的账号信息以继续
              </p>
            </div>

            <ConfigProvider
              theme={{
                token: {
                  fontFamily: UI_FONT,
                  fontSize: 15,
                  colorText: loginText.body,
                  colorTextSecondary: loginText.muted,
                  colorTextPlaceholder: loginText.hint,
                  colorBgContainer: '#ffffff',
                  colorBorder: loginText.inputBorder,
                  colorPrimary: currentColorTheme.primary,
                  borderRadiusLG: 12,
                },
                components: {
                  Form: {
                    labelFontSize: 15,
                    labelColor: loginText.label,
                    verticalLabelPadding: '0 0 10px',
                    itemMarginBottom: 20,
                  },
                  Input: {
                    inputFontSizeLG: 15,
                    paddingLG: 11,
                    colorBgContainer: '#ffffff',
                    activeBorderColor: currentColorTheme.primary,
                    hoverBorderColor: loginText.inputBorderHover,
                    activeShadow: `0 0 0 2px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.2)`,
                  },
                  Checkbox: {
                    fontSize: 14,
                    colorText: loginText.muted,
                  },
                },
              }}
            >
              <Form
                name="login"
                size="large"
                onFinish={handleSubmit}
                autoComplete="off"
                initialValues={{ username: '', password: '', remember: true }}
                layout="vertical"
                requiredMark
                colon={false}
              >
                <Form.Item
                  name="username"
                  label="用户名"
                  rules={[{ required: true, message: '请输入用户名' }]}
                >
                  <Input
                    prefix={<UserOutlined style={{ color: loginText.iconInInput }} />}
                    placeholder="请输入用户名"
                    onFocus={() => {
                      setIsTyping(true);
                      setIsPassword(false);
                    }}
                    onBlur={() => setIsTyping(false)}
                    style={{
                      borderRadius: 12,
                      height: 48,
                      borderColor: loginText.border,
                      color: loginText.body,
                    }}
                  />
                </Form.Item>

                <Form.Item
                  name="password"
                  label="密码"
                  rules={[{ required: true, message: '请输入密码' }]}
                >
                  <Input.Password
                    prefix={<LockOutlined style={{ color: loginText.iconInInput }} />}
                    placeholder="请输入密码"
                    onFocus={() => {
                      setIsPassword(true);
                      setIsTyping(false);
                    }}
                    onBlur={() => setIsPassword(false)}
                    style={{
                      borderRadius: 12,
                      height: 48,
                      borderColor: loginText.border,
                      color: loginText.body,
                    }}
                  />
                </Form.Item>

                <div className="flex items-center justify-between mb-6">
                  <Form.Item name="remember" valuePropName="checked" noStyle>
                    <Checkbox className="text-[14px]" style={{ color: loginText.muted }}>
                      记住登录状态
                    </Checkbox>
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
                      fontSize: 16,
                      letterSpacing: '0.02em',
                      border: 'none',
                      backgroundImage: currentColorTheme.gradient,
                      fontFamily: UI_FONT,
                      boxShadow: `0 4px 14px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.4)`,
                    }}
                  >
                    登录
                  </Button>
                </Form.Item>
              </Form>
            </ConfigProvider>
            <style>{`
              .admin-login-card .ant-form-item-label > label {
                font-weight: 500 !important;
              }
              .admin-login-card .ant-form-item .ant-form-item-label > label.ant-form-item-required:not(.ant-form-item-required-mark-optional)::before {
                margin-inline-end: 6px;
                font-size: 13px;
                line-height: 1;
                color: ${currentColorTheme.primary} !important;
              }
            `}</style>
          </div>
        </div>

        {/* 底部 */}
        <div className="shrink-0 px-6 sm:px-12 lg:px-16 xl:px-24 py-3 sm:py-4 text-center lg:text-left">
          <p className="text-xs text-white/55 drop-shadow-sm">
            访问
            <a
              href="/"
              className="mx-1 hover:underline font-medium"
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

const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { themeId: colorThemeId } = useModel('colorModel');
  const currentColorTheme = getColorThemeById(colorThemeId);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/admin/dashboard');
    }
  }, [navigate]);

  // 登录页全屏铺满视口，禁止 html/body 因光晕负定位等出现外层滚动条
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const prevHtmlOverflow = html.style.overflow;
    const prevBodyOverflow = body.style.overflow;
    html.style.overflow = 'hidden';
    body.style.overflow = 'hidden';
    return () => {
      html.style.overflow = prevHtmlOverflow;
      body.style.overflow = prevBodyOverflow;
    };
  }, []);

  return (
    <div className="admin-login-page fixed inset-0 z-[1] h-[100dvh] overflow-hidden">
      <ParticlesBackground theme="tyndall" isDark themeColor={currentColorTheme.primary} />
      <AdminLoginLayout currentColorTheme={currentColorTheme} />
    </div>
  );
};

export default AdminLoginPage;
