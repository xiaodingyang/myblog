import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'umi';
import { Layout, Menu, Input, Space, Typography, Divider, Row, Col, ConfigProvider, Drawer } from 'antd';
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
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
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 md:gap-3 no-underline shrink-0">
          <div 
            className="w-9 h-9 md:w-10 md:h-10 rounded-xl flex items-center justify-center text-white font-bold text-base md:text-lg"
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
                style={{ background: currentColorTheme.gradient }}
              >
                B
              </div>
              <Title level={5} className="!mb-0" style={{ color: '#1e293b' }}>
                个人博客
              </Title>
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
                    background: currentColorTheme.gradient,
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
