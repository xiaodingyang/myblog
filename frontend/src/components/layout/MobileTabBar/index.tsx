import React from 'react';
import { useLocation, history } from 'umi';
import { HomeOutlined, ReadOutlined, AppstoreOutlined, UserOutlined } from '@ant-design/icons';
import { useModel } from 'umi';
import { getColorThemeById } from '@/config/colorThemes';

const tabs = [
  { key: '/', icon: HomeOutlined, label: '首页' },
  { key: '/articles', icon: ReadOutlined, label: '文章' },
  { key: '/categories', icon: AppstoreOutlined, label: '分类' },
  { key: '/tags', icon: UserOutlined, label: '标签' },
];

const MobileTabBar: React.FC = () => {
  const location = useLocation();
  const { themeId: colorThemeId } = useModel('colorModel');
  const currentColorTheme = getColorThemeById(colorThemeId);

  const activeKey = tabs.find(t => t.key !== '/' && location.pathname.startsWith(t.key))?.key
    || (location.pathname === '/' ? '/' : '');

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around"
      style={{
        height: 56,
        background: 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(20px) saturate(180%)',
        borderTop: '1px solid rgba(0,0,0,0.06)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      {tabs.map(tab => {
        const isActive = tab.key === activeKey;
        const Icon = tab.icon;
        return (
          <button
            key={tab.key}
            onClick={() => history.push(tab.key)}
            style={{
              flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', gap: 2, border: 'none', background: 'none',
              cursor: 'pointer', padding: '6px 0',
              color: isActive ? currentColorTheme.primary : '#9ca3af',
              transition: 'color 0.2s',
            }}
          >
            <Icon style={{ fontSize: 20 }} />
            <span style={{ fontSize: 10, fontWeight: isActive ? 600 : 400 }}>{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
};

export default MobileTabBar;
