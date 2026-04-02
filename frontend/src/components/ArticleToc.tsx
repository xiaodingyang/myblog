import React, { useEffect, useState, useCallback } from 'react';
import { Drawer, Button } from 'antd';
import { UnorderedListOutlined } from '@ant-design/icons';
import type { TocItem } from '@/utils/markdownToc';

interface ArticleTocProps {
  items: TocItem[];
  primaryColor?: string;
}

const HEADER_OFFSET = 80;

const ArticleToc: React.FC<ArticleTocProps> = ({ items, primaryColor = '#3b82f6' }) => {
  const [activeId, setActiveId] = useState<string>('');
  const [mobileOpen, setMobileOpen] = useState(false);

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
      }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [items]);

  const list = (
    <nav aria-label="文章目录" className="text-sm">
      <div className="font-semibold text-slate-800 mb-3 pb-2 border-b border-slate-200">目录</div>
      <ul className="list-none m-0 p-0 space-y-0.5 max-h-[calc(100vh-10rem)] overflow-y-auto pr-1">
        {items.map((item) => (
          <li key={`${item.level}-${item.id}`}>
            <button
              type="button"
              onClick={() => scrollToId(item.id)}
              className={`w-full text-left rounded-lg px-3 py-2 transition-all duration-200 border-l-2 text-[13px] leading-snug ${
                item.level === 3 ? 'pl-5' : item.level >= 4 ? 'pl-7' : 'pl-3'
              } ${
                activeId === item.id
                  ? 'bg-slate-100 font-medium'
                  : 'hover:bg-slate-50 text-slate-600'
              }`}
              style={{
                borderLeftColor: activeId === item.id ? primaryColor : 'transparent',
              }}
            >
              <span className="line-clamp-2">{item.text}</span>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );

  if (!items.length) return null;

  return (
    <>
      <aside
        className="hidden lg:block w-52 shrink-0"
        style={{ alignSelf: 'flex-start' }}
      >
        <div
          className="sticky py-4 px-4 rounded-2xl border border-slate-200/80 bg-white shadow-sm"
          style={{ top: HEADER_OFFSET }}
        >
          {list}
        </div>
      </aside>

      <div className="lg:hidden fixed right-4 bottom-24 z-40">
        <Button
          type="primary"
          shape="circle"
          size="large"
          icon={<UnorderedListOutlined />}
          onClick={() => setMobileOpen(true)}
          aria-label="打开目录"
          style={{ boxShadow: '0 4px 12px rgba(15,23,42,0.2)' }}
        />
      </div>
      <Drawer
        title="目录"
        placement="right"
        width={280}
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        styles={{ body: { paddingTop: 8 } }}
      >
        {list}
      </Drawer>
    </>
  );
};

export default ArticleToc;
