import React, { useEffect, useState } from 'react';
import { Outlet, Link, useLocation, useNavigate, useModel } from 'umi';
import { Layout, Menu, Avatar, Dropdown, Typography, Space, Button, theme, message } from 'antd';
import {
  DashboardOutlined,
  FileTextOutlined,
  FolderOutlined,
  TagsOutlined,
  MessageOutlined,
  SettingOutlined,
  LogoutOutlined,
  UserOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  HomeOutlined,
  TeamOutlined,
  CommentOutlined,
  OrderedListOutlined,
  BarChartOutlined,
} from '@ant-design/icons';

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;

const AdminLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { initialState, setInitialState } = useModel('@@initialState');
  const [collapsed, setCollapsed] = useState(false);
  const { token: { colorBgContainer, borderRadiusLG } } = theme.useToken();

  useEffect(() => {
    // 检查登录状态
    const token = localStorage.getItem('token');
    if (!token) {
      // 延迟执行，避免在 render 阶段调用 message
      setTimeout(() => {
        message.warning('请先登录');
        navigate('/admin/login');
      }, 0);
    }
  }, [navigate]);

  const menuItems = [
    {
      key: '/admin/dashboard',
      icon: <DashboardOutlined />,
      label: '仪表盘',
      onClick: () => navigate('/admin/dashboard'),
    },
    {
      key: '/admin/articles',
      icon: <FileTextOutlined />,
      label: '文章管理',
      onClick: () => navigate('/admin/articles'),
    },
    {
      key: '/admin/categories',
      icon: <FolderOutlined />,
      label: '分类管理',
      onClick: () => navigate('/admin/categories'),
    },
    {
      key: '/admin/tags',
      icon: <TagsOutlined />,
      label: '标签管理',
      onClick: () => navigate('/admin/tags'),
    },
    {
      key: '/admin/messages',
      icon: <MessageOutlined />,
      label: '留言管理',
      onClick: () => navigate('/admin/messages'),
    },
    {
      key: '/admin/comments',
      icon: <CommentOutlined />,
      label: '评论管理',
      onClick: () => navigate('/admin/comments'),
    },
    {
      key: '/admin/users',
      icon: <TeamOutlined />,
      label: '用户管理',
      onClick: () => navigate('/admin/users'),
    },
    {
      key: '/admin/settings',
      icon: <SettingOutlined />,
      label: '个人设置',
      onClick: () => navigate('/admin/settings'),
    },
    {
      key: '/admin/series',
      icon: <OrderedListOutlined />,
      label: '系列管理',
      onClick: () => navigate('/admin/series'),
    },
    {
      key: '/admin/stats',
      icon: <BarChartOutlined />,
      label: '访客统计',
      onClick: () => navigate('/admin/stats'),
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setInitialState({ currentUser: undefined, token: undefined });
    message.success('退出登录成功');
    navigate('/admin/login');
  };

  const userMenuItems = [
    {
      key: 'home',
      icon: <HomeOutlined />,
      label: '返回前台',
      onClick: () => navigate('/'),
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: '个人设置',
      onClick: () => navigate('/admin/settings'),
    },
    { type: 'divider' as const },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: handleLogout,
      danger: true,
    },
  ];

  const getSelectedKey = () => {
    const path = location.pathname;
    // 处理子路由
    if (path.startsWith('/admin/articles')) return '/admin/articles';
    return path;
  };

  /** 访客统计：主区占满一屏，避免外层再出现滚动条 */
  const isStatsPage = location.pathname === '/admin/stats';

  return (
    <Layout className={isStatsPage ? 'min-h-screen flex flex-col' : 'min-h-screen'}>
      {/* 侧边栏 */}
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={240}
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)',
        }}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-center border-b border-gray-700">
          <Link to="/admin/dashboard" className="flex items-center gap-3 no-underline">
            <div
              className="w-8 h-8 rounded-card-sm flex items-center justify-center text-white font-bold"
              style={{
                background: 'linear-gradient(135deg, #1677ff 0%, #722ed1 100%)',
              }}
            >
              若
            </div>
            {!collapsed && (
              <Title level={5} className="!mb-0 !text-white">
                博客后台
              </Title>
            )}
          </Link>
        </div>

        {/* 菜单 */}
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[getSelectedKey()]}
          items={menuItems}
          style={{ background: 'transparent', borderRight: 0 }}
        />
      </Sider>

      <Layout
        style={{
          marginLeft: collapsed ? 80 : 240,
          transition: 'margin-left 0.2s',
          minHeight: '100vh',
          ...(isStatsPage
            ? {
              display: 'flex',
              flexDirection: 'column',
              height: '100vh',
              maxHeight: '100vh',
              overflow: 'hidden',
            }
            : {}),
        }}
      >
        {/* 顶部栏 */}
        <Header 
          className="flex items-center justify-between px-6"
          style={{ 
            background: colorBgContainer,
            boxShadow: '0 1px 4px rgba(0, 0, 0, 0.08)',
            position: 'sticky',
            top: 0,
            zIndex: 10,
          }}
        >
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            className="text-lg"
          />

          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <Space className="cursor-pointer hover:bg-gray-100 px-3 py-1 rounded-card-sm transition-colors">
              <Avatar 
                size={36}
                icon={<UserOutlined />}
                src={initialState?.currentUser?.avatar}
                style={{ background: 'linear-gradient(135deg, #1677ff 0%, #722ed1 100%)' }}
              />
              <Text className="hidden md:inline">
                {initialState?.currentUser?.username || '管理员'}
              </Text>
            </Space>
          </Dropdown>
        </Header>

        {/* 内容区 */}
        <Content
          className={isStatsPage ? undefined : 'm-6'}
          style={
            isStatsPage
              ? {
                flex: 1,
                minHeight: 0,
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                margin: '8px 16px 16px',
                padding: 0,
              }
              : undefined
          }
        >
          <div
            className={
              isStatsPage
                ? 'admin-console'
                : 'p-6 min-h-[calc(100vh-64px-48px)] admin-console'
            }
            style={{
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
              ...(isStatsPage
                ? {
                  flex: 1,
                  minHeight: 0,
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                }
                : {}),
            }}
          >
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;
