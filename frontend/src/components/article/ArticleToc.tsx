import React, { useEffect, useState, useCallback } from 'react';
import { Drawer, Button } from 'antd';
import { UnorderedListOutlined } from '@ant-design/icons';
import type { TocItem } from '@/utils/markdownToc';

interface ArticleTocProps {
  items: TocItem[];
  primaryColor?: string;
  /** 主题渐变，用于标题下装饰条 */
  gradient?: string;
}

const HEADER_OFFSET = 80;

/** 与文章区 max-w-7xl（80rem）对齐：大屏时贴在内容区右缘内侧 */
const FIXED_RIGHT_STYLE: React.CSSProperties = {
  right: 'max(1rem, calc((100vw - 80rem) / 2 + 1.5rem))',
};

const ArticleToc: React.FC<ArticleTocProps> = ({
  items,
  primaryColor = '#3b82f6',
  gradient,
}) => {
  const [activeId, setActiveId] = useState<string>('');
  const [mobileOpen, setMobileOpen] = useState(false);

  const railColor = 'rgba(255,255,255,0.22)';
  const activeBg = `${primaryColor}28`;

  const scrollToId = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET;
    window.scrollTo({ top, behavior: 'smooth' });
    setMobileOpen(false);
  }, []);

  useEffect(() => {
    if (!items.length) return;
    const elements = items.map((t) => document.getElementById(t.id)).filter(Boolean) as HTMLElement[];
    if (!elements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]?.target?.id) {
          setActiveId(visible[0].target.id);
        }
      },
      {
        rootMargin: `-${HEADER_OFFSET}px 0px -55% 0px`,
        threshold: [0, 0.25, 0.5, 1],
      },
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [items]);

  const heading = (
    <div className="mb-3 px-1">
      <div className="text-[11px] font-semibold tracking-[0.12em] uppercase text-white/90">
        本页目录
      </div>
      <div
        className="mt-2 h-0.5 w-9 rounded-full"
        style={{ background: gradient || primaryColor }}
      />
    </div>
  );

  const linkList = (opts: { inDrawer?: boolean }) => (
    <nav aria-label="文章目录" className="text-[13px] leading-snug">
      <ul
        className="relative m-0 list-none border-l pl-0"
        style={{
          borderLeftWidth: 1,
          borderLeftColor: opts.inDrawer ? `${primaryColor}35` : railColor,
          maxHeight: opts.inDrawer ? 'calc(100vh - 8rem)' : 'calc(100vh - 10rem)',
          overflowY: 'auto',
        }}
      >
        {items.map((item) => {
          const active = activeId === item.id;
          const indent = item.level === 3 ? 12 : 0;
          return (
            <li key={`${item.level}-${item.id}`} className="m-0 p-0">
              <button
                type="button"
                title={item.text}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => scrollToId(item.id)}
                className="group w-full min-w-0 border-0 bg-transparent text-left cursor-pointer rounded-r-md transition-[color,background-color] duration-200"
                style={{
                  marginLeft: -1,
                  paddingLeft: 10 + indent,
                  paddingRight: 8,
                  paddingTop: 6,
                  paddingBottom: 6,
                  borderLeft: active ? `2px solid ${primaryColor}` : '2px solid transparent',
                  color: active ? primaryColor : 'rgba(255,255,255,0.88)',
                  fontWeight: active ? 600 : 400,
                  backgroundColor: active ? activeBg : 'transparent',
                }}
                onMouseEnter={(e) => {
                  if (!active) e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)';
                }}
                onMouseLeave={(e) => {
                  if (!active) e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <span
                  className="block w-full min-w-0 truncate"
                  style={{
                    fontSize: item.level === 3 ? 12 : 13,
                    color: active ? primaryColor : item.level === 3 ? 'rgba(255,255,255,0.78)' : 'rgba(255,255,255,0.92)',
                  }}
                >
                  {item.text}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );

  if (!items.length) return null;

  const panelClass =
    'rounded-xl border py-3 px-3 backdrop-blur-md shadow-lg border-white/15 bg-slate-900/78';

  return (
    <>
      {/* 占位，与固定目录同宽，避免正文铺满全行 */}
      <div className="hidden lg:block w-56 shrink-0" aria-hidden="true" />

      <div
        className="article-toc-fixed hidden lg:block w-56"
        style={{
          position: 'fixed',
          top: HEADER_OFFSET,
          /* 高于正文 Card / List 等层叠，且低于顶栏 z-50 */
          zIndex: 45,
          ...FIXED_RIGHT_STYLE,
        }}
      >
        <div
          className={panelClass}
          style={{
            boxShadow: `0 12px 40px rgba(0,0,0,0.35), 0 0 0 1px ${primaryColor}18`,
          }}
        >
          {heading}
          {linkList({ inDrawer: false })}
        </div>
      </div>

      {/* bottom 需高于 FloatingActionsRail（含小苹果 + 文章「跳评论」等），避免与竖向 FAB 叠在一起 */}
      <div className="lg:hidden fixed right-4 bottom-[22rem] z-40 max-[380px]:bottom-[20rem]">
        <Button
          type="primary"
          shape="circle"
          size="large"
          icon={<UnorderedListOutlined />}
          onClick={() => setMobileOpen(true)}
          aria-label="打开目录"
          style={{
            background: gradient || primaryColor,
            borderColor: 'transparent',
            boxShadow: `0 4px 14px ${primaryColor}55`,
          }}
        />
      </div>
      <Drawer
        title={<span className="text-base font-semibold text-white">本页目录</span>}
        placement="right"
        width={300}
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        styles={{
          body: { paddingTop: 8, background: '#0f172a' },
          header: {
            background: '#0f172a',
            borderBottom: `1px solid ${primaryColor}33`,
            color: '#fff',
          },
        }}
      >
        <div className="-mt-1">{linkList({ inDrawer: true })}</div>
      </Drawer>
    </>
  );
};

export default ArticleToc;
