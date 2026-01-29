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
      message.warning('请先登录');
      navigate('/admin/login');
    }
  }, [navigate]);

  const menuItems = [
    {
      key: '/admin/dashboard',
      icon: <DashboardOutlined />,
      label: <Link to="/admin/dashboard">仪表盘</Link>,
    },
    {
      key: '/admin/articles',
      icon: <FileTextOutlined />,
      label: <Link to="/admin/articles">文章管理</Link>,
    },
    {
      key: '/admin/categories',
      icon: <FolderOutlined />,
      label: <Link to="/admin/categories">分类管理</Link>,
    },
    {
      key: '/admin/tags',
      icon: <TagsOutlined />,
      label: <Link to="/admin/tags">标签管理</Link>,
    },
    {
      key: '/admin/messages',
      icon: <MessageOutlined />,
      label: <Link to="/admin/messages">留言管理</Link>,
    },
    {
      key: '/admin/settings',
      icon: <SettingOutlined />,
      label: <Link to="/admin/settings">个人设置</Link>,
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

  return (
    <Layout className="min-h-screen">
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
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold"
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

      <Layout style={{ marginLeft: collapsed ? 80 : 240, transition: 'margin-left 0.2s' }}>
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
            <Space className="cursor-pointer hover:bg-gray-100 px-3 py-1 rounded-lg transition-colors">
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
        <Content className="m-6">
          <div 
            className="p-6 min-h-[calc(100vh-64px-48px)]"
            style={{ 
              background: colorBgContainer, 
              borderRadius: borderRadiusLG,
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
