import React from 'react';
import { Outlet, Link, useLocation } from 'umi';
import { Layout, Menu, Input, Space, Typography, Divider, Row, Col, ConfigProvider } from 'antd';
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
} from '@ant-design/icons';
import { useModel } from 'umi';
import ParticlesBackground from '@/components/ParticlesBackground';
import ParticleThemeSelector from '@/components/ParticleThemeSelector';
import GlassBackground from '@/components/GlassBackground';
import { getThemeById } from '@/config/particleThemes';
import { getColorThemeById } from '@/config/colorThemes';

const { Header, Content, Footer } = Layout;
const { Title, Text, Paragraph } = Typography;

const FrontLayout: React.FC = () => {
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  const { themeId } = useModel('particleModel');
  const { themeId: colorThemeId } = useModel('colorModel');
  const currentTheme = getThemeById(themeId);
  const currentColorTheme = getColorThemeById(colorThemeId);
  
  // 获取主题背景色 - 现在由毛玻璃背景组件处理，Layout 使用透明背景
  const getBackgroundStyle = () => {
    // 所有页面都使用透明背景，让毛玻璃背景组件处理背景效果
    return { background: 'transparent' };
  };
  
  // 获取头部样式
  const getHeaderStyle = () => {
    const headerBg = currentTheme.headerBackground || (isHomePage ? 'rgba(15, 23, 42, 0.9)' : 'rgba(255, 255, 255, 0.95)');
    const headerTextColor = currentTheme.headerTextColor || (isHomePage ? '#fff' : '#1e293b');
    return {
      background: headerBg,
      backdropFilter: 'blur(8px)',
      boxShadow: isHomePage ? 'none' : '0 2px 8px rgba(0, 0, 0, 0.06)',
      height: 64,
      color: headerTextColor,
    };
  };
  
  const headerTextColor = currentTheme.headerTextColor || (isHomePage ? '#fff' : '#1e293b');
  const isDarkTheme = currentTheme.headerTextColor === '#fff' || isHomePage;

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
        style={getHeaderStyle()}
      >
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 no-underline">
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-lg"
            style={{
              background: currentColorTheme.gradient,
            }}
          >
            B
          </div>
          <Title level={4} className="!mb-0 hidden md:block" style={{ color: headerTextColor }}>
            个人博客
          </Title>
        </Link>

        {/* 导航菜单 */}
        <Menu
          mode="horizontal"
          selectedKeys={[getSelectedKey()]}
          items={menuItems}
          className={`flex-1 justify-center border-none bg-transparent ${isDarkTheme ? 'home-menu' : ''}`}
          style={{ minWidth: 0, flex: 1, justifyContent: 'center' }}
        />

        {/* 搜索框 */}
        <Input
          placeholder="搜索文章..."
          prefix={<SearchOutlined className={isDarkTheme ? 'text-white/50' : 'text-gray-400'} />}
          className={`w-40 md:w-52 ${isDarkTheme ? 'home-search' : ''}`}
          style={{ 
            borderRadius: 20,
          }}
          onPressEnter={(e) => {
            const value = (e.target as HTMLInputElement).value;
            if (value) {
              window.location.href = `/articles?keyword=${encodeURIComponent(value)}`;
            }
          }}
        />
      </Header>

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
        <div className="max-w-6xl mx-auto px-6 py-12">
          <Row gutter={[48, 32]}>
            <Col xs={24} md={8}>
              <div className="flex items-center gap-3 mb-4">
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-lg"
                  style={{
                    background: 'linear-gradient(135deg, #ffb3d9 0%, #ff91c7 100%)', // 淡粉色渐变
                  }}
                >
                  B
                </div>
                <Title level={4} className="!mb-0 !text-white">
                  个人博客
                </Title>
              </div>
              <Paragraph className="text-gray-400 text-sm">
                记录技术成长，分享学习心得。坚持输出，持续进步。
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
                <a href="mailto:example@email.com" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2">
                  <MailOutlined /> example@email.com
                </a>
                <a href="https://github.com" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2">
                  <GithubOutlined /> GitHub
                </a>
              </Space>
            </Col>
          </Row>
          <Divider className="!border-gray-700 !my-8" />
          <div className="text-center text-gray-500 text-sm">
            © {new Date().getFullYear()} 个人博客. All rights reserved.
          </div>
        </div>
      </Footer>
      )}
    </Layout>
    </ConfigProvider>
  );
};

export default FrontLayout;
