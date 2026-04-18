import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Dropdown, Modal, message } from 'antd';
import type { MenuProps } from 'antd';
import {
  RobotOutlined,
  CopyOutlined,
  ShareAltOutlined,
  LinkOutlined,
  RocketOutlined,
  DesktopOutlined,
  ReloadOutlined,
  HomeOutlined,
  ReadOutlined,
  FolderOutlined,
  MessageOutlined,
  UserOutlined,
  TrophyOutlined,
  StarOutlined,
  QqOutlined,
  WeiboCircleOutlined,
} from '@ant-design/icons';
import { history, useLocation, useModel } from 'umi';
import { QRCodeSVG } from 'qrcode.react';
import { useAiApple } from '@/contexts/AiAppleContext';
import { ARTICLE_AI_ASSISTANT_NAME } from '@/components/shared/floatingActionsConstants';
import {
  getShareUrl,
  copyLink,
  nativeShare,
  shareToQQ,
  shareToWeibo,
  canUseNativeShare,
} from '@/components/shared/ShareButton';
import { BORDER_RADIUS, FONT_SIZE, TRANSITION } from '@/styles/designTokens';

const ARTICLE_PATH = /^\/article\/[^/]+\/?$/;

/** 菜单排序：标签可见字符数少的在前；同长度按中文拼音序稳定排序 */
function labelCharCount(label: React.ReactNode): number {
  if (typeof label !== 'string') return 0;
  return Array.from(label).length;
}

function compareMenuLabel(a: React.ReactNode, b: React.ReactNode): number {
  const ca = labelCharCount(a);
  const cb = labelCharCount(b);
  if (ca !== cb) return ca - cb;
  const sa = typeof a === 'string' ? a : '';
  const sb = typeof b === 'string' ? b : '';
  return sa.localeCompare(sb, 'zh-Hans-CN');
}

function getMenuItemLabel(item: NonNullable<MenuProps['items']>[number]): React.ReactNode {
  if (!item || typeof item === 'string') return '';
  if ('type' in item && item.type === 'divider') return '';
  if ('label' in item) return item.label;
  return '';
}

function shouldIgnoreContextMenuTarget(el: HTMLElement | null): boolean {
  if (!el) return true;
  if (el.closest('input, textarea, [contenteditable="true"]')) return true;
  if (el.closest('[data-skip-context-menu]')) return true;
  if (el.closest('.ant-modal-wrap, .ant-image-preview-root')) return true;
  if (el.closest('.ant-select-dropdown, .ant-picker-dropdown, .ant-cascader-menus')) return true;
  if (el.closest('.site-context-menu-root')) return true;
  if (el.closest('.ant-dropdown-menu') && !el.closest('.site-context-menu-root')) return true;
  return false;
}

function getArticleShareMeta(): { title: string; summary: string; url: string } {
  const url = getShareUrl();
  let title = document.title || '若风的博客';
  title = title.replace(/\s*[-|]\s*若风的博客.*$/i, '').trim() || '若风的博客';
  const summary =
    document.querySelector('meta[name="description"]')?.getAttribute('content') || '';
  return { title, summary, url };
}

/**
 * 全站自定义右键菜单：Ant Design Dropdown + 固定锚点（光标处）绝对定位。
 * 需在 AiAppleProvider 内使用。
 */
const SiteContextMenu: React.FC = () => {
  const location = useLocation();
  const { openAssistant } = useAiApple();
  const { isLoggedIn, requireAuth } = useModel('githubUserModel');
  const allowNativeRef = useRef(false);
  const anchorRef = useRef<HTMLSpanElement>(null);

  const [ctx, setCtx] = useState({
    open: false,
    x: 0,
    y: 0,
    selectedText: '',
  });

  const [shareOpen, setShareOpen] = useState(false);
  const [shareMeta, setShareMeta] = useState({ title: '', summary: '', url: '' });
  const [supportsNative, setSupportsNative] = useState(false);

  useEffect(() => {
    setSupportsNative(canUseNativeShare());
  }, []);

  const isArticlePage = ARTICLE_PATH.test(location.pathname || '');

  const closeMenu = useCallback(() => {
    setCtx((c) => ({ ...c, open: false }));
  }, []);

  const openShareModal = useCallback(() => {
    setShareMeta(getArticleShareMeta());
    setShareOpen(true);
  }, []);

  const handleMenuClick: MenuProps['onClick'] = (info) => {
    const { key } = info;
    // rc-menu / antd 部分路径下只有 legacy `event`；若不阻止默认与冒泡，点击会穿透到菜单下方的 <a> 等，表现为整页跳转或「刷新」
    const ev =
      info.domEvent ??
      (info as { event?: React.SyntheticEvent }).event;
    ev?.preventDefault();
    ev?.stopPropagation();

    if (key === 'apple') {
      openAssistant();
      closeMenu();
      return;
    }
    if (key === 'copy-selection') {
      const text = ctx.selectedText.trim();
      if (text) {
        navigator.clipboard.writeText(text).then(
          () => message.success('已复制选中内容'),
          () => message.error('复制失败'),
        );
      }
      closeMenu();
      return;
    }
    if (key === 'copy-page-url') {
      const url = typeof window !== 'undefined' ? window.location.href : '';
      navigator.clipboard.writeText(url).then(
        () => message.success('本页链接已复制'),
        () => message.error('复制失败'),
      );
      closeMenu();
      return;
    }
    if (key === 'reload-page') {
      closeMenu();
      window.location.reload();
      return;
    }
    if (key === 'native-menu') {
      allowNativeRef.current = true;
      closeMenu();
      message.info('请在页面空白处再次右键，将显示系统菜单');
      return;
    }
    if (key === 'share-panel') {
      if (!isArticlePage) return;
      requireAuth(() => {
        openShareModal();
        closeMenu();
      });
      return;
    }
    const navMap: Record<string, string> = {
      'nav-home': '/',
      'nav-articles': '/articles',
      'nav-categories': '/categories',
      'nav-message': '/message',
      'nav-about': '/about',
      'nav-rankings': '/rankings',
      ...(isLoggedIn ? { 'nav-favorites': '/favorites' } : {}),
    };
    if (navMap[key]) {
      history.push(navMap[key]);
      closeMenu();
    }
  };

  const menuItems = useMemo<MenuProps['items']>(() => {
    const hasSelection = ctx.selectedText.trim().length > 0;

    // 与顶栏一致：未登录不展示「收藏」入口
    const navChildren: NonNullable<MenuProps['items']> = [
      { key: 'nav-home', icon: <HomeOutlined />, label: '首页' },
      { key: 'nav-articles', icon: <ReadOutlined />, label: '文章' },
      { key: 'nav-categories', icon: <FolderOutlined />, label: '分类' },
      { key: 'nav-message', icon: <MessageOutlined />, label: '留言板' },
      { key: 'nav-about', icon: <UserOutlined />, label: '关于作者' },
      { key: 'nav-rankings', icon: <TrophyOutlined />, label: '排行榜' },
      ...(isLoggedIn ? [{ key: 'nav-favorites', icon: <StarOutlined />, label: '收藏' }] : []),
    ].sort((a, b) => compareMenuLabel(getMenuItemLabel(a), getMenuItemLabel(b)));

    const topRaw: NonNullable<MenuProps['items']> = [
      {
        key: 'apple',
        icon: <RobotOutlined />,
        label: ARTICLE_AI_ASSISTANT_NAME,
      },
      {
        key: 'copy-selection',
        icon: <CopyOutlined />,
        label: '复制',
        disabled: !hasSelection,
      },
      ...(isArticlePage
        ? [
            {
              key: 'share-panel',
              icon: <ShareAltOutlined />,
              label: '分享',
              disabled: false,
            },
          ]
        : []),
      {
        key: 'copy-page-url',
        icon: <LinkOutlined />,
        label: '复制本页链接',
      },
      {
        key: 'reload-page',
        icon: <ReloadOutlined />,
        label: '刷新',
      },
      {
        key: 'nav',
        icon: <RocketOutlined />,
        label: '快捷跳转',
        children: navChildren,
      },
      {
        key: 'native-menu',
        icon: <DesktopOutlined />,
        label: '显示浏览器默认菜单',
      },
    ];

    const sortedTop = [...topRaw].sort((a, b) =>
      compareMenuLabel(getMenuItemLabel(a), getMenuItemLabel(b)),
    );

    const nativeMenu = sortedTop.find(
      (it) => it && typeof it === 'object' && 'key' in it && (it as { key: string }).key === 'native-menu',
    );
    const rest = sortedTop.filter(
      (it) => !(it && typeof it === 'object' && 'key' in it && (it as { key: string }).key === 'native-menu'),
    );

    if (nativeMenu) {
      return [...rest, { type: 'divider' }, nativeMenu];
    }
    return sortedTop;
  }, [ctx.selectedText, isArticlePage, isLoggedIn]);

  useEffect(() => {
    const onCaptureContextMenu = (e: MouseEvent) => {
      if (allowNativeRef.current) {
        allowNativeRef.current = false;
        return;
      }
      const t = e.target as HTMLElement | null;
      if (shouldIgnoreContextMenuTarget(t)) {
        return;
      }
      e.preventDefault();
      const selectedText = window.getSelection()?.toString() || '';
      setCtx({
        open: true,
        x: e.clientX,
        y: e.clientY,
        selectedText,
      });
    };

    document.addEventListener('contextmenu', onCaptureContextMenu, true);
    return () => document.removeEventListener('contextmenu', onCaptureContextMenu, true);
  }, []);

  useLayoutEffect(() => {
    const el = anchorRef.current;
    if (!el || !ctx.open) return;
    el.style.left = `${ctx.x}px`;
    el.style.top = `${ctx.y}px`;
  }, [ctx.open, ctx.x, ctx.y]);

  const sharePanel = (
    <div style={{ width: 240 }}>
      <div style={{ textAlign: 'center', marginBottom: 12 }}>
        <QRCodeSVG value={shareMeta.url} size={140} level="M" />
        <div style={{ color: '#64748b', fontSize: FONT_SIZE.BODY_SMALL, marginTop: 6 }}>微信扫码分享</div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
        {supportsNative && (
          <button
            type="button"
            onClick={async () => {
              const ok = await nativeShare(shareMeta.title, shareMeta.url, shareMeta.summary);
              if (ok) setShareOpen(false);
            }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 4,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '6px 10px',
              borderRadius: BORDER_RADIUS.CARD_SMALL,
              transition: `background ${TRANSITION.FAST}`,
            }}
          >
            <ShareAltOutlined style={{ fontSize: 22, color: '#1677ff' }} />
            <span style={{ fontSize: FONT_SIZE.CAPTION, color: '#64748b' }}>系统分享</span>
          </button>
        )}
        <button
          type="button"
          onClick={() => {
            shareToQQ(shareMeta.title, shareMeta.summary, shareMeta.url);
            setShareOpen(false);
          }}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 4,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '6px 10px',
            borderRadius: BORDER_RADIUS.CARD_SMALL,
          }}
        >
          <QqOutlined style={{ fontSize: 22, color: '#12B7F5' }} />
          <span style={{ fontSize: FONT_SIZE.CAPTION, color: '#64748b' }}>QQ 空间</span>
        </button>
        <button
          type="button"
          onClick={() => {
            shareToWeibo(shareMeta.title, shareMeta.url);
            setShareOpen(false);
          }}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 4,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '6px 10px',
            borderRadius: BORDER_RADIUS.CARD_SMALL,
          }}
        >
          <WeiboCircleOutlined style={{ fontSize: 22, color: '#E6162D' }} />
          <span style={{ fontSize: FONT_SIZE.CAPTION, color: '#64748b' }}>微博</span>
        </button>
        <button
          type="button"
          onClick={() => {
            copyLink(shareMeta.url);
            setShareOpen(false);
          }}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 4,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '6px 10px',
            borderRadius: BORDER_RADIUS.CARD_SMALL,
          }}
        >
          <LinkOutlined style={{ fontSize: 22, color: '#64748b' }} />
          <span style={{ fontSize: FONT_SIZE.CAPTION, color: '#64748b' }}>复制链接</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      <Dropdown
        open={ctx.open}
        onOpenChange={(open) => {
          if (!open) setCtx((c) => ({ ...c, open: false }));
        }}
        placement="bottomLeft"
        destroyPopupOnHide
        getPopupContainer={() => document.body}
        rootClassName="site-context-menu-root"
        zIndex={10060}
        menu={{ items: menuItems, onClick: handleMenuClick }}
      >
        <span
          ref={anchorRef}
          className="site-context-menu-anchor"
          aria-hidden
          tabIndex={-1}
          style={{
            position: 'fixed',
            width: 1,
            height: 1,
            margin: 0,
            padding: 0,
            border: 0,
            overflow: 'hidden',
            clip: 'rect(0 0 0 0)',
            zIndex: 10050,
          }}
        />
      </Dropdown>

      <Modal
        title="分享本篇"
        open={shareOpen}
        onCancel={() => setShareOpen(false)}
        footer={null}
        destroyOnClose
        width={320}
      >
        {!isLoggedIn ? (
          <div className="text-center py-4 text-slate-600">
            <p className="mb-3">登录后可使用完整分享能力</p>
            <button
              type="button"
              className="text-blue-600 underline"
              onClick={() => {
                setShareOpen(false);
                requireAuth();
              }}
            >
              去登录
            </button>
          </div>
        ) : (
          sharePanel
        )}
      </Modal>
    </>
  );
};

export default SiteContextMenu;
