import React from 'react';
import { useLocation, history } from 'umi';
import { HomeOutlined, ReadOutlined, AppstoreOutlined, UserOutlined } from '@ant-design/icons';
import { useModel } from 'umi';
import { getColorThemeById } from '@/config/colorThemes';
import { FONT_SIZE, TRANSITION } from '@/styles/designTokens';

const tabs = [
  { key: '/', icon: HomeOutlined, label: '首页' },
  { key: '/articles', icon: ReadOutlined, label: '文章' },
  { key: '/categories', icon: AppstoreOutlined, label: '分类' },
];

const MobileTabBar: React.FC = () => {
  const location = useLocation();
  const { themeId: colorThemeId } = useModel('colorModel');
  const currentColorTheme = getColorThemeById(colorThemeId);

  const path = location.pathname;
  const activeKey = (() => {
    const hit = tabs.find((t) => t.key !== '/' && path.startsWith(t.key));
    if (hit) return hit.key;
    if (path === '/') return '/';
    if (
      path.startsWith('/tag') ||
      path.startsWith('/tags') ||
      path.startsWith('/category') ||
      path.startsWith('/categories')
    ) {
      return '/categories';
    }
    return '';
  })();

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
              transition: `color ${TRANSITION.FAST}`,
            }}
          >
            <Icon style={{ fontSize: FONT_SIZE.ICON_MEDIUM }} />
            <span style={{ fontSize: FONT_SIZE.TAG, fontWeight: isActive ? 600 : 400 }}>{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
};

export default MobileTabBar;
