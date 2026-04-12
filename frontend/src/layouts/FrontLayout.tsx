import React, { useState, useEffect, useMemo, lazy, Suspense } from 'react';
import { Outlet, Link, useLocation, history } from 'umi';
import PageTransition from '@/components/visual/PageTransition';
import {
  FAB_RIGHT_PX,
  FAB_KEYBOARD_BOTTOM_PX,
  FAB_GAP_PX,
} from '@/components/shared/floatingActionsConstants';
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
  TrophyOutlined,
  StarOutlined,
} from '@ant-design/icons';
import { useModel } from 'umi';
import GradientText from '@/components/visual/GradientText';
import GithubLoginModal from '@/components/shared/GithubLoginModal';
import GuestLoginPrompt from '@/components/shared/GuestLoginPrompt';
import ReadingProgressBar from '@/components/reading/ReadingProgressBar';
import BackToTop from '@/components/layout/BackToTop';
import KeyboardHelpButton from '@/components/shared/KeyboardHelpButton';
import KeyboardShortcutsHelpModal from '@/components/shared/KeyboardShortcutsHelpModal';
import GlobalSearch from '@/components/shared/GlobalSearch';
import NotificationBell from '@/components/shared/NotificationBell';
import ReadingStatsModal from '@/components/reading/ReadingStats';
import MobileTabBar from '@/components/layout/MobileTabBar';
import { getColorThemeById } from '@/config/colorThemes';
import analytics from '@/utils/analytics';

const LazyParticlesBackground = lazy(() => import('@/components/visual/ParticlesBackground'));
const LazyParticleThemeSelector = lazy(() => import('@/components/visual/ParticleThemeSelector'));

const { Header, Content, Footer } = Layout;
const { Title, Text, Paragraph } = Typography;

const FrontLayout: React.FC = () => {
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  const { themeId: colorThemeId } = useModel('colorModel');
  const currentColorTheme = getColorThemeById(colorThemeId);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [statsOpen, setStatsOpen] = useState(false);
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const goOffline = () => setIsOffline(true);
    const goOnline = () => setIsOffline(false);
    setIsOffline(!navigator.onLine);
    window.addEventListener('offline', goOffline);
    window.addEventListener('online', goOnline);
    return () => {
      window.removeEventListener('offline', goOffline);
      window.removeEventListener('online', goOnline);
    };
  }, []);

  // 初始化访客统计 SDK
  useEffect(() => {
    analytics.init();
    return () => { analytics.destroy(); };
  }, []);
  const [showParticles, setShowParticles] = useState(false);
  const [showThemeSelector, setShowThemeSelector] = useState(false);
  const { githubUser, isLoggedIn, logout, setLoginModalVisible } = useModel('githubUserModel');

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      setTimeout(() => setShowParticles(true), 100);
    });
    return () => cancelAnimationFrame(id);
  }, []);

  // 延迟加载主题选择器组件，进一步减少首屏负担
  useEffect(() => {
    const timer = setTimeout(() => setShowThemeSelector(true), 500);
    return () => clearTimeout(timer);
  }, []);

  // 关键路由预加载：首屏渲染后，浏览器空闲时预加载高频页面 JS chunk
 useEffect(() => {
    const prefetchRoutes = () => {
      // 预加载文章列表页和文章详情页的 chunk
      const prefetchPaths = ['/articles', '/article/prefetch'];
      prefetchPaths.forEach((path) => {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = path;
        link.as = 'document';
        document.head?.appendChild(link);
      });
    };
    if ('requestIdleCallback' in window) {
      const id = requestIdleCallback(prefetchRoutes, { timeout: 5000 });
      return () => cancelIdleCallback(id as number);
    } else {
      const timer = setTimeout(prefetchRoutes, 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  // 注释掉自动弹窗，避免与 GuestLoginPrompt 浮层重复
  // useEffect(() => {
  //   if (!isLoggedIn) {
  //     const shown = sessionStorage.getItem('login_prompt_shown');
  //     if (!shown) {
  //       const timer = setTimeout(() => {
  //         setLoginModalVisible(true);
  //         sessionStorage.setItem('login_prompt_shown', '1');
  //       }, 3000);
  //       return () => clearTimeout(timer);
  //     }
  //   }
  // }, [isLoggedIn, setLoginModalVisible]);

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

  // Keyboard shortcuts
  const [showHelp, setShowHelp] = useState(false);
  useEffect(() => {
    let gPressed = false;
    let gTimer: ReturnType<typeof setTimeout> | null = null;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in input/textarea
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      const key = e.key.toLowerCase();

      // Ctrl+K / Cmd+K: 全局搜索
      if ((e.ctrlKey || e.metaKey) && key === 'k') {
        e.preventDefault();
        setSearchOpen(prev => !prev);
        return;
      }

      // g h: go home
      if (key === 'g' && !gPressed) {
        gPressed = true;
        if (gTimer) clearTimeout(gTimer);
        gTimer = setTimeout(() => { gPressed = false; }, 1000);
        return;
      }
      if (gPressed && key === 'h') {
        e.preventDefault();
        gPressed = false;
        if (gTimer) clearTimeout(gTimer);
        history.push('/');
        return;
      }

      // j: next article
      if (key === 'j') {
        e.preventDefault();
        const nextLink = document.querySelector('[data-nav-next]') as HTMLAnchorElement;
        if (nextLink) nextLink.click();
        return;
      }

      // k: previous article
      if (key === 'k') {
        e.preventDefault();
        const prevLink = document.querySelector('[data-nav-prev]') as HTMLAnchorElement;
        if (prevLink) prevLink.click();
        return;
      }

      // ?: show help
      if (key === '?') {
        e.preventDefault();
        setShowHelp(prev => !prev);
        return;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      if (gTimer) clearTimeout(gTimer);
    };
  }, []);

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

  // 顶栏：深色毛玻璃 + 白色系导航（首页也统一为白色系，更贴合粒子星空背景）
  const useDarkHeader = true;

  // 获取头部样式
  const getHeaderStyle = () => {
    const rgb = hexToRgb(currentColorTheme.primary);

    if (!useDarkHeader && isHomePage) {
      const headerBg = `linear-gradient(90deg, 
          rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.15) 0%, 
          rgba(255, 255, 255, 0.85) 50%, 
          rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.15) 100%
        )`;
      return {
        background: headerBg,
        backdropFilter: 'blur(20px) saturate(180%)',
        boxShadow: `0 4px 30px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.1)`,
        height: 64,
        color: '#1e293b',
        borderBottom: `1px solid rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.15)`,
      };
    }

    const headerBg = `linear-gradient(90deg, 
        rgba(15, 23, 42, 0.78) 0%, 
        rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.22) 50%,
        rgba(15, 23, 42, 0.78) 100%
      )`;

    return {
      background: headerBg,
      backdropFilter: 'blur(20px) saturate(180%)',
      boxShadow: '0 4px 24px rgba(0, 0, 0, 0.28)',
      height: 64,
      color: '#f8fafc',
      borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
    };
  };

  const headerTextColor = useDarkHeader ? 'rgba(248, 250, 252, 0.95)' : '#1e293b';
  const isDarkTheme = false; // 粒子/毛玻璃底：浅色参数；顶栏单独用 useDarkHeader

  const menuItems = useMemo(() => {
    const items = [
      { key: '/', icon: <HomeOutlined />, label: <Link to="/">首页</Link> },
      { key: '/articles', icon: <ReadOutlined />, label: <Link to="/articles">文章</Link> },
      { key: '/categories', icon: <FolderOutlined />, label: <Link to="/categories">分类</Link> },
      { key: '/tags', icon: <TagsOutlined />, label: <Link to="/tags">标签</Link> },
      { key: '/rankings', icon: <TrophyOutlined />, label: <Link to="/rankings">排行榜</Link> },
      ...(isLoggedIn
        ? [{ key: '/favorites', icon: <StarOutlined />, label: <Link to="/favorites">我的收藏</Link> }]
        : []),
      { key: '/message', icon: <MessageOutlined />, label: <Link to="/message">留言</Link> },
      { key: '/about', icon: <UserOutlined />, label: <Link to="/about">关于</Link> },
    ];
    return items;
  }, [isLoggedIn]);

  const getSelectedKey = () => {
    const path = location.pathname;
    if (path === '/') return '/';
    if (path.startsWith('/article/')) return '/articles';
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
          '--theme-primary-rgb': (() => {
            const hex = currentColorTheme.primary.replace('#', '');
            return `${parseInt(hex.substring(0,2),16)}, ${parseInt(hex.substring(2,4),16)}, ${parseInt(hex.substring(4,6),16)}`;
          })(),
        } as React.CSSProperties & { '--theme-primary': string; '--theme-gradient': string; '--theme-primary-rgb': string }}
      >
        {/* 粒子背景（内含玻璃背景层） - 延迟加载 */}
        {showParticles && (
          <Suspense fallback={null}>
            <LazyParticlesBackground isDark={isDarkTheme} />
          </Suspense>
        )}

        {/* 右侧悬浮按钮：单容器竖向排列，保证同一条垂直线与间距一致 */}
        <div
          className="fixed z-[60] flex flex-col items-center"
          style={{ right: FAB_RIGHT_PX, bottom: FAB_KEYBOARD_BOTTOM_PX, gap: FAB_GAP_PX }}
        >
          <BackToTop embedded />
          {showThemeSelector && (
            <Suspense fallback={null}>
              <LazyParticleThemeSelector isDark={isDarkTheme} embedded />
            </Suspense>
          )}
          <KeyboardHelpButton embedded />
        </div>

        {/* 头部导航 */}
        <ReadingProgressBar />

        {isOffline && (
          <div
            style={{
              position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9998,
              background: '#fbbf24', color: '#78350f', textAlign: 'center',
              padding: '6px 16px', fontSize: 13, fontWeight: 500,
            }}
          >
            当前处于离线模式，部分内容可能不是最新
          </div>
        )}

        <Header
          className={`fixed w-full z-50 px-4 md:px-8 flex items-center justify-between${useDarkHeader ? ' front-header-dark' : ''}`}
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
            {/* 通知铃铛 */}
            {isLoggedIn && <NotificationBell />}
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
                    {
                      key: 'stats',
                      label: '阅读统计',
                      icon: <StarOutlined />,
                      onClick: () => setStatsOpen(true),
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
                <div
                  className={`flex items-center gap-2 cursor-pointer px-2 py-1 rounded-full transition-colors ${useDarkHeader ? 'hover:bg-white/10' : 'hover:bg-black/5'}`}
                >
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
                  backgroundImage: currentColorTheme.gradient,
                  color: '#fff',
                  border: 'none',
                  cursor: 'pointer',
                }}
                onClick={() => setLoginModalVisible(true)}
                aria-label="GitHub 登录"
              >
                <GithubOutlined />
                登录
              </button>
            )}

            {/* RSS 订阅 */}
            <a
              href="/api/rss/"
              target="_blank"
              rel="noreferrer"
              title="RSS 订阅"
              aria-label="RSS 订阅"
              className="hidden sm:flex items-center justify-center w-8 h-8 rounded-full transition-colors"
              style={{
                background: useDarkHeader ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.05)',
                color: headerTextColor,
              }}
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                <circle cx="6.18" cy="17.82" r="2.18"/>
                <path d="M4 4.44v2.83c7.03 0 12.73 5.7 12.73 12.73h2.83c0-8.59-6.97-15.56-15.56-15.56zm0 5.66v2.83c3.9 0 7.07 3.17 7.07 7.07h2.83c0-5.47-4.43-9.9-9.9-9.9z"/>
              </svg>
            </a>

            {/* 搜索框 - PC端显示 */}
            <div className="hidden sm:block" style={{ width: 160 }}>
              <Input
                placeholder="搜索..."
                prefix={<SearchOutlined className="text-gray-400" />}
                className="header-search"
                onPressEnter={(e) => {
                  const value = (e.target as HTMLInputElement).value;
                  if (value) {
                    history.push(`/articles?keyword=${encodeURIComponent(value)}`);
                  }
                }}
              />
            </div>

            {/* 移动端搜索按钮 */}
            <button
              className="sm:hidden w-9 h-9 rounded-full flex items-center justify-center transition-colors"
              style={{
                background: useDarkHeader ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.05)',
                border: 'none',
                cursor: 'pointer',
              }}
              onClick={() => {
                const keyword = prompt('请输入搜索关键词');
                if (keyword) {
                  history.push(`/articles?keyword=${encodeURIComponent(keyword)}`);
                }
              }}
            >
              <SearchOutlined style={{ color: headerTextColor, fontSize: 16 }} />
            </button>

            {/* 移动端菜单按钮 */}
            <button
              className="md:hidden w-9 h-9 rounded-full flex items-center justify-center transition-colors"
              style={{
                background: useDarkHeader ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.05)',
                border: 'none',
                cursor: 'pointer',
              }}
              onClick={() => setMobileMenuOpen(true)}
              aria-label="打开导航菜单"
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
                    history.push(`/articles?keyword=${encodeURIComponent(value)}`);
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
                    <span className="font-medium">
                      {item.key === '/'
                        ? '首页'
                        : item.key === '/articles'
                          ? '文章'
                          : item.key === '/categories'
                            ? '分类'
                            : item.key === '/tags'
                              ? '标签'
                              : item.key === '/rankings'
                                ? '排行榜'
                                : item.key === '/favorites'
                                  ? '我的收藏'
                                  : item.key === '/message'
                                    ? '留言'
                                    : '关于'}
                    </span>
                  </Link>
                );
              })}
            </nav>

            {/* 底部信息 */}
            <div className="p-4 border-t border-gray-100">
              <div className="flex items-center gap-4 justify-center">
                <a href="mailto:346629678@qq.com" className="text-gray-400 hover:text-gray-600 transition-colors">
                  <MailOutlined style={{ fontSize: 20 }} />
                </a>
                <a href="https://github.com/xiaodingyang" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-gray-600 transition-colors">
                  <GithubOutlined style={{ fontSize: 20 }} />
                </a>
              </div>
            </div>
          </div>
        </Drawer>

        {/* 主内容区 */}
        <Content
          className={isHomePage ? 'pt-16 overflow-hidden home-layout-content' : 'pt-16 pb-14 md:pb-0 flex-1'}
          style={{
            position: 'relative',
            zIndex: isHomePage ? 10 : 2, // 确保内容在毛玻璃背景之上
          }}
        >
          <PageTransition locationKey={location.pathname}>
            <div className={isHomePage ? 'h-full min-h-0' : ''}>
              <Outlet />
            </div>
          </PageTransition>
        </Content>

        {/* 页脚 - 首页不显示 */}
        {!isHomePage && (
          <Footer
            className="p-0"
            style={{
              background: `linear-gradient(180deg, rgba(15, 23, 42, 0.78) 0%, rgba(${hexToRgb(currentColorTheme.primary).r}, ${hexToRgb(currentColorTheme.primary).g}, ${hexToRgb(currentColorTheme.primary).b}, 0.22) 50%, rgba(15, 23, 42, 0.78) 100%)`,
              backdropFilter: 'blur(20px) saturate(180%)',
              boxShadow: '0 -4px 24px rgba(0, 0, 0, 0.28)',
              borderTop: '1px solid rgba(255, 255, 255, 0.12)',
              position: 'relative',
              zIndex: 10,
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
                  <Paragraph style={{ color: 'rgba(255, 255, 255, 0.8)' }} className="text-sm">
                    8年前端开发经验，专注 React/Vue/TypeScript。记录技术成长，分享学习心得。
                  </Paragraph>
                </Col>
                <Col xs={24} md={8}>
                  <Title level={5} style={{ color: '#fff' }} className="!mb-4">快速链接</Title>
                  <Space direction="vertical" size={8}>
                    <Link to="/" style={{ color: 'rgba(255, 255, 255, 0.8)' }} className="hover:text-white transition-colors">首页</Link>
                    <Link to="/articles" style={{ color: 'rgba(255, 255, 255, 0.8)' }} className="hover:text-white transition-colors">文章</Link>
                    <Link to="/categories" style={{ color: 'rgba(255, 255, 255, 0.8)' }} className="hover:text-white transition-colors">分类</Link>
                    <Link to="/rankings" style={{ color: 'rgba(255, 255, 255, 0.8)' }} className="hover:text-white transition-colors">排行榜</Link>
                    <Link to="/about" style={{ color: 'rgba(255, 255, 255, 0.8)' }} className="hover:text-white transition-colors">关于我</Link>
                  </Space>
                </Col>
                <Col xs={24} md={8}>
                  <Title level={5} style={{ color: '#fff' }} className="!mb-4">联系方式</Title>
                  <Space direction="vertical" size={8}>
                    <a href="mailto:346629678@qq.com" style={{ color: 'rgba(255, 255, 255, 0.8)' }} className="hover:text-white transition-colors flex items-center gap-2">
                      <MailOutlined /> 346629678@qq.com
                    </a>
                    <a href="https://github.com/xiaodingyang" target="_blank" rel="noreferrer" style={{ color: 'rgba(255, 255, 255, 0.8)' }} className="hover:text-white transition-colors flex items-center gap-2">
                      <GithubOutlined /> GitHub
                    </a>
                    <a href="https://juejin.cn/user/712139266339694" target="_blank" rel="noreferrer" style={{ color: 'rgba(255, 255, 255, 0.8)' }} className="hover:text-white transition-colors flex items-center gap-2">
                      📘 掘金：风居住de街道
                    </a>
                  </Space>
                </Col>
              </Row>
              <Divider style={{ borderColor: 'rgba(255, 255, 255, 0.2)' }} className="!my-8" />
              <div className="text-center text-sm" style={{ color: 'rgba(255, 255, 255, 0.65)' }}>
                © {new Date().getFullYear()} 肖定阳的博客. All rights reserved.
                <span className="mx-2">|</span>
                <a
                  href="https://beian.miit.gov.cn/"
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: 'rgba(255, 255, 255, 0.65)' }}
                  className="hover:text-white transition-colors"
                >
                  蜀ICP备2026005106号
                </a>
              </div>
            </div>
          </Footer>
        )}
        <GithubLoginModal />
        <GuestLoginPrompt />
        <KeyboardShortcutsHelpModal visible={showHelp} onClose={() => setShowHelp(false)} />
        <GlobalSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
        <ReadingStatsModal open={statsOpen} onClose={() => setStatsOpen(false)} />
        <MobileTabBar />
      </Layout>
    </ConfigProvider>
  );
};

export default FrontLayout;
