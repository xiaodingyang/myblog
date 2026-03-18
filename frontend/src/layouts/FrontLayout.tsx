import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'umi';
import { Layout, Menu, Input, Space, Typography, Divider, Row, Col, ConfigProvider, Drawer, Avatar, Dropdown, message } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import {
  HomeOutlined,
  ReadOutlined,
  TagsOutlined,
  FolderOutlined,
  MessageOutlined,
  UserOutlined,
  GithubOutlined,
  MailOutlined,
  SearchOutlined,
  MenuOutlined,
  CloseOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import { useModel } from 'umi';
import ParticlesBackground from '@/components/ParticlesBackground';
import ParticleThemeSelector from '@/components/ParticleThemeSelector';
import GlassBackground from '@/components/GlassBackground';
import GradientText from '@/components/GradientText';
import GithubLoginModal from '@/components/GithubLoginModal';
import { getColorThemeById } from '@/config/colorThemes';

const { Header, Content, Footer } = Layout;
const { Title, Text, Paragraph } = Typography;

const FrontLayout: React.FC = () => {
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  const { themeId: colorThemeId } = useModel('colorModel');
  const currentColorTheme = getColorThemeById(colorThemeId);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { githubUser, isLoggedIn, logout, setLoginModalVisible } = useModel('githubUserModel');

  useEffect(() => {
    if (!isLoggedIn) {
      const shown = sessionStorage.getItem('login_prompt_shown');
      if (!shown) {
        const timer = setTimeout(() => {
          setLoginModalVisible(true);
          sessionStorage.setItem('login_prompt_shown', '1');
        }, 3000);
        return () => clearTimeout(timer);
      }
    }
  }, [isLoggedIn, setLoginModalVisible]);

  useEffect(() => {
    if (isLoggedIn) return;
    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      message.info('登录后即可复制内容');
      setLoginModalVisible(true);
    };
    document.addEventListener('copy', handleCopy);
    return () => document.removeEventListener('copy', handleCopy);
  }, [isLoggedIn, setLoginModalVisible]);

  // 获取主题背景色 - 现在由毛玻璃背景组件处理，Layout 使用透明背景
  const getBackgroundStyle = () => {
    // 所有页面都使用透明背景，让毛玻璃背景组件处理背景效果
    return { background: 'transparent' };
  };

  // 从主题色提取 RGB
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) }
      : { r: 255, g: 179, b: 217 };
  };

  // 获取头部样式
  const getHeaderStyle = () => {
    const rgb = hexToRgb(currentColorTheme.primary);

    // 使用主题色衍生的半透明背景
    const headerBg = isHomePage
      ? `linear-gradient(90deg, 
          rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.15) 0%, 
          rgba(255, 255, 255, 0.85) 50%, 
          rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.15) 100%
        )`
      : `linear-gradient(90deg, 
          rgba(255, 255, 255, 0.95) 0%, 
          rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.08) 50%,
          rgba(255, 255, 255, 0.95) 100%
        )`;

    return {
      background: headerBg,
      backdropFilter: 'blur(20px) saturate(180%)',
      boxShadow: `0 4px 30px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.1)`,
      height: 64,
      color: '#1e293b',
      borderBottom: `1px solid rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.15)`,
    };
  };

  const headerTextColor = '#1e293b'; // 统一使用深色文字
  const isDarkTheme = false; // 导航栏现在是浅色的

  const menuItems = [
    { key: '/', icon: <HomeOutlined />, label: <Link to="/">首页</Link> },
    { key: '/articles', icon: <ReadOutlined />, label: <Link to="/articles">文章</Link> },
    { key: '/categories', icon: <FolderOutlined />, label: <Link to="/categories">分类</Link> },
    { key: '/tags', icon: <TagsOutlined />, label: <Link to="/tags">标签</Link> },
    { key: '/message', icon: <MessageOutlined />, label: <Link to="/message">留言</Link> },
    { key: '/about', icon: <UserOutlined />, label: <Link to="/about">关于</Link> },
  ];

  const getSelectedKey = () => {
    const path = location.pathname;
    if (path === '/') return '/';
    const firstPath = '/' + path.split('/')[1];
    return firstPath;
  };

  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        token: {
          colorPrimary: currentColorTheme.primary,
          borderRadius: 8,
          colorBgContainer: '#ffffff',
        },
        components: {
          Button: {
            borderRadius: 8,
          },
          Card: {
            borderRadiusLG: 12,
          },
          Input: {
            borderRadius: 8,
          },
        },
      }}
    >
      <Layout
        className={isHomePage ? 'h-screen overflow-hidden' : 'min-h-screen'}
        style={{
          ...getBackgroundStyle(),
          '--theme-primary': currentColorTheme.primary,
          '--theme-gradient': currentColorTheme.gradient,
        } as React.CSSProperties & { '--theme-primary': string; '--theme-gradient': string }}
      >
        {/* 毛玻璃背景层 - 先渲染，作为底层背景 */}
        <GlassBackground isDark={isDarkTheme} />

        {/* 粒子背景 - 在毛玻璃之上，确保粒子可见 */}
        <ParticlesBackground isDark={isDarkTheme} />

        {/* 粒子主题选择器 */}
        <ParticleThemeSelector isDark={isDarkTheme} />

        {/* 头部导航 */}
        <Header
          className="fixed w-full z-50 px-4 md:px-8 flex items-center justify-between"
          style={{
            ...getHeaderStyle(),
            overflow: 'visible',
          }}
        >
          {/* Logo - 复用底部的实现，避免渐变条问题 */}
          <Link to="/" className="flex items-center gap-2 md:gap-3 no-underline shrink-0">
            <div
              className="w-9 h-9 md:w-10 md:h-10 rounded-xl flex items-center justify-center text-white font-bold text-base md:text-lg"
              style={{
                backgroundImage: currentColorTheme.gradient,
                backgroundRepeat: 'no-repeat',
                backgroundSize: '100% 100%',
                backgroundColor: 'transparent',
              }}
            >
              风
            </div>
            <GradientText
              text="若风"
              gradientId="logo-header-gradient"
              from="#ffffff"
              mid={currentColorTheme.primary}
              to="#ffd700"
              className="hidden md:block font-bold text-2xl"
            />
          </Link>

          {/* PC端导航菜单 */}
          <Menu
            mode="horizontal"
            selectedKeys={[getSelectedKey()]}
            items={menuItems}
            className={`hidden md:flex flex-1 justify-center border-none bg-transparent ${isDarkTheme ? 'home-menu' : ''}`}
            style={{ minWidth: 0, flex: 1, justifyContent: 'center' }}
          />

          {/* 右侧操作区 */}
          <div className="flex items-center gap-3 shrink-0">
            {/* GitHub 用户状态 */}
            {isLoggedIn && githubUser ? (
              <Dropdown
                menu={{
                  items: [
                    {
                      key: 'profile',
                      label: (
                        <a href={githubUser.htmlUrl} target="_blank" rel="noreferrer">
                          GitHub 主页
                        </a>
                      ),
                      icon: <GithubOutlined />,
                    },
                    { type: 'divider' },
                    {
                      key: 'logout',
                      label: '退出登录',
                      icon: <LogoutOutlined />,
                      danger: true,
                      onClick: () => {
                        logout();
                        message.success('已退出登录');
                      },
                    },
                  ],
                }}
                placement="bottomRight"
              >
                <div className="flex items-center gap-2 cursor-pointer px-2 py-1 rounded-full transition-colors hover:bg-black/5">
                  <Avatar size={28} src={githubUser.avatar} icon={<GithubOutlined />} />
                  <span className="hidden sm:inline text-sm" style={{ color: headerTextColor, maxWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {githubUser.nickname || githubUser.username}
                  </span>
                </div>
              </Dropdown>
            ) : (
              <button
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-all hover:scale-105"
                style={{
                  background: '#24292e',
                  color: '#fff',
                  border: 'none',
                  cursor: 'pointer',
                }}
                onClick={() => setLoginModalVisible(true)}
              >
                <GithubOutlined />
                登录
              </button>
            )}

            {/* 搜索框 - PC端显示 */}
            <div className="hidden sm:block" style={{ width: 160 }}>
              <Input
                placeholder="搜索..."
                prefix={<SearchOutlined className="text-gray-400" />}
                className="header-search"
                onPressEnter={(e) => {
                  const value = (e.target as HTMLInputElement).value;
                  if (value) {
                    window.location.href = `/articles?keyword=${encodeURIComponent(value)}`;
                  }
                }}
              />
            </div>

            {/* 移动端搜索按钮 */}
            <button
              className="sm:hidden w-9 h-9 rounded-full flex items-center justify-center transition-colors"
              style={{
                background: 'rgba(0, 0, 0, 0.05)',
                border: 'none',
                cursor: 'pointer',
              }}
              onClick={() => {
                const keyword = prompt('请输入搜索关键词');
                if (keyword) {
                  window.location.href = `/articles?keyword=${encodeURIComponent(keyword)}`;
                }
              }}
            >
              <SearchOutlined style={{ color: headerTextColor, fontSize: 16 }} />
            </button>

            {/* 移动端菜单按钮 */}
            <button
              className="md:hidden w-9 h-9 rounded-full flex items-center justify-center transition-colors"
              style={{
                background: 'rgba(0, 0, 0, 0.05)',
                border: 'none',
                cursor: 'pointer',
              }}
              onClick={() => setMobileMenuOpen(true)}
            >
              <MenuOutlined style={{ color: headerTextColor, fontSize: 18 }} />
            </button>
          </div>
        </Header>

        {/* 移动端导航抽屉 */}
        <Drawer
          placement="right"
          open={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
          width={280}
          closable={false}
          styles={{
            body: { padding: 0 },
            header: { display: 'none' },
          }}
        >
          <div className="h-full flex flex-col" style={{ background: `linear-gradient(180deg, ${currentColorTheme.primary}08 0%, #ffffff 100%)` }}>
            {/* 抽屉头部 */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <Link to="/" className="flex items-center gap-2 no-underline" onClick={() => setMobileMenuOpen(false)}>
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold"
                  style={{
                    backgroundImage: currentColorTheme.gradient,
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: '100% 100%',
                    backgroundColor: 'transparent',
                  }}
                >
                  风
                </div>
                <span 
                  className="font-bold text-lg"
                  style={{ 
                    background: `linear-gradient(135deg, ${currentColorTheme.primary} 0%, #ff6b6b 50%, #ffd700 100%)`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  若风
                </span>
              </Link>
              <button
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(0, 0, 0, 0.05)', border: 'none', cursor: 'pointer' }}
                onClick={() => setMobileMenuOpen(false)}
              >
                <CloseOutlined style={{ fontSize: 14, color: '#64748b' }} />
              </button>
            </div>

            {/* 移动端搜索框 */}
            <div className="p-4">
              <Input
                placeholder="搜索文章..."
                prefix={<SearchOutlined className="text-gray-400" />}
                style={{ borderRadius: 20 }}
                onPressEnter={(e) => {
                  const value = (e.target as HTMLInputElement).value;
                  if (value) {
                    setMobileMenuOpen(false);
                    window.location.href = `/articles?keyword=${encodeURIComponent(value)}`;
                  }
                }}
              />
            </div>

            {/* 菜单列表 */}
            <nav className="flex-1 px-2">
              {menuItems.map((item) => {
                const isActive = getSelectedKey() === item.key;
                return (
                  <Link
                    key={item.key}
                    to={item.key}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl mb-1 no-underline transition-all"
                    style={{
                      background: isActive ? `${currentColorTheme.primary}15` : 'transparent',
                      color: isActive ? currentColorTheme.primary : '#475569',
                    }}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span className="text-lg">{item.icon}</span>
                    <span className="font-medium">{item.key === '/' ? '首页' : item.key === '/articles' ? '文章' : item.key === '/categories' ? '分类' : item.key === '/tags' ? '标签' : item.key === '/message' ? '留言' : '关于'}</span>
                  </Link>
                );
              })}
            </nav>

            {/* 底部信息 */}
            <div className="p-4 border-t border-gray-100">
              <div className="flex items-center gap-4 justify-center">
                <a href="mailto:example@email.com" className="text-gray-400 hover:text-gray-600 transition-colors">
                  <MailOutlined style={{ fontSize: 20 }} />
                </a>
                <a href="https://github.com" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-gray-600 transition-colors">
                  <GithubOutlined style={{ fontSize: 20 }} />
                </a>
              </div>
            </div>
          </div>
        </Drawer>

        {/* 主内容区 */}
        <Content
          className={isHomePage ? 'pt-16 h-[calc(100vh-64px)] overflow-hidden' : 'pt-16'}
          style={{
            position: 'relative',
            zIndex: isHomePage ? 10 : 2, // 确保内容在毛玻璃背景之上
          }}
        >
          <div className={isHomePage ? 'h-full' : 'min-h-[calc(100vh-64px-200px)]'}>
            <Outlet />
          </div>
        </Content>

        {/* 页脚 - 首页不显示 */}
        {!isHomePage && (
          <Footer
            className="p-0"
            style={{
              background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)',
            }}
          >
            <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-12">
              <Row gutter={[48, 32]}>
                <Col xs={24} md={8}>
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-lg"
                      style={{
                        backgroundImage: currentColorTheme.gradient,
                        backgroundRepeat: 'no-repeat',
                        backgroundSize: '100% 100%',
                        backgroundColor: 'transparent',
                      }}
                    >
                      风
                    </div>
                    <GradientText
                      text="若风"
                      gradientId="logo-footer-gradient"
                      from="#ffffff"
                      mid={currentColorTheme.primary}
                      to="#ffd700"
                      className="font-bold text-2xl"
                    />
                  </div>
                  <Paragraph className="text-gray-400 text-sm">
                    8年前端开发经验，专注 React/Vue/TypeScript。记录技术成长，分享学习心得。
                  </Paragraph>
                </Col>
                <Col xs={24} md={8}>
                  <Title level={5} className="!text-white !mb-4">快速链接</Title>
                  <Space direction="vertical" size={8}>
                    <Link to="/" className="text-gray-400 hover:text-white transition-colors">首页</Link>
                    <Link to="/articles" className="text-gray-400 hover:text-white transition-colors">文章</Link>
                    <Link to="/categories" className="text-gray-400 hover:text-white transition-colors">分类</Link>
                    <Link to="/about" className="text-gray-400 hover:text-white transition-colors">关于我</Link>
                  </Space>
                </Col>
                <Col xs={24} md={8}>
                  <Title level={5} className="!text-white !mb-4">联系方式</Title>
                  <Space direction="vertical" size={8}>
                    <a href="mailto:346629678@qq.com" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2">
                      <MailOutlined /> 346629678@qq.com
                    </a>
                    <a href="https://github.com/xiaodingyang" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2">
                      <GithubOutlined /> GitHub
                    </a>
                    <a href="https://juejin.cn/user/712139266339694" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2">
                      📘 掘金：风居住de街道
                    </a>
                  </Space>
                </Col>
              </Row>
              <Divider className="!border-gray-700 !my-8" />
              <div className="text-center text-gray-500 text-sm">
                © {new Date().getFullYear()} 肖定阳的博客. All rights reserved.
                <span className="mx-2">|</span>
                <a
                  href="https://beian.miit.gov.cn/"
                  target="_blank"
                  rel="noreferrer"
                  className="text-gray-500 hover:text-gray-300 transition-colors"
                >
                  蜀ICP备2026005106号
                </a>
              </div>
            </div>
          </Footer>
        )}
        <GithubLoginModal />
      </Layout>
    </ConfigProvider>
  );
};

export default FrontLayout;
