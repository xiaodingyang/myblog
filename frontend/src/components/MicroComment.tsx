import React, { useEffect, useRef, useState } from 'react';
import { loadMicroApp } from 'qiankun';
import type { MicroApp } from 'qiankun';

interface MicroCommentProps {
  articleId: string;
  token?: string;
  username?: string;
}

const getMicroAppEntry = (): string => {
  if (process.env.NODE_ENV === 'production') {
    return '/myblog-comment-mf';
  }
  const configuredEntry = process.env.UMI_APP_COMMENT_MF_ENTRY;
  if (configuredEntry) {
    return configuredEntry;
  }
  // 避免主应用占用 8002 时把自己当作子应用加载，默认切到 8003（子应用固定开发端口）
  if (typeof window !== 'undefined' && window.location.port === '8002') {
    return '//localhost:8003/myblog-comment-mf';
  }
  return '//localhost:8002/myblog-comment-mf';
};

export default function MicroComment({ articleId, token, username }: MicroCommentProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const microAppRef = useRef<MicroApp | null>(null);
  const microMountedRef = useRef(false);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const propsRef = useRef({ articleId, token, username });
  propsRef.current = { articleId, token, username };
  const lastPushedPropsRef = useRef<{ articleId: string; token?: string; username?: string } | null>(
    null,
  );

  useEffect(() => {
    if (!articleId || !containerRef.current) return;

    if (microAppRef.current) {
      microAppRef.current.unmount();
      microAppRef.current = null;
    }

    let cancelled = false;
    microMountedRef.current = false;
    setLoading(true);
    setError(false);
    lastPushedPropsRef.current = null;

    try {
      const bootProps = propsRef.current;
      // 勿用 sandbox.loose：UMD 子应用把库挂在 self(沙箱 proxy) 上，loose 时 import-html-entry 用 window 解析 scriptExports 会失败
      microAppRef.current = loadMicroApp({
        name: 'myblog-comment-mf',
        entry: getMicroAppEntry(),
        container: containerRef.current,
        props: {
          ...bootProps,
          base: '/myblog-comment-mf',
          history: { type: 'memory' },
        },
      });

      microAppRef.current
        .mountPromise
        .then(() => {
          if (cancelled) return;
          microMountedRef.current = true;
          setLoading(false);
          const latest = propsRef.current;
          lastPushedPropsRef.current = { ...latest };
          try {
            microAppRef.current?.update?.(latest);
          } catch {
            /* update 在部分版本上挂载完成前不可用 */
          }
        })
        .catch((err) => {
          if (cancelled) return;
          console.error('[MicroComment] Mount failed:', err);
          setError(true);
          setLoading(false);
        });
    } catch (err) {
      if (!cancelled) {
        console.error('[MicroComment] Failed to load micro app:', err);
        setError(true);
        setLoading(false);
      }
    }

    return () => {
      cancelled = true;
      microMountedRef.current = false;
      if (microAppRef.current) {
        try { microAppRef.current.unmount(); } catch {}
        microAppRef.current = null;
      }
    };
  }, [articleId]);

  useEffect(() => {
    if (!microMountedRef.current || !microAppRef.current?.update) return;
    const prev = lastPushedPropsRef.current;
    if (
      prev &&
      prev.articleId === articleId &&
      prev.token === token &&
      prev.username === username
    ) {
      return;
    }
    microAppRef.current.update({ articleId, token, username });
    lastPushedPropsRef.current = { articleId, token, username };
  }, [articleId, token, username]);

  if (!articleId) {
    return (
      <div style={{ padding: '24px', textAlign: 'center', color: '#999' }}>
        无法加载评论
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        padding: '24px',
        textAlign: 'center',
        color: '#999',
        background: '#f9f9f9',
        borderRadius: '8px'
      }}>
        <p>评论组件加载失败，请刷新页面重试</p>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', minHeight: loading ? 120 : undefined }}>
      {loading && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(255,255,255,0.85)',
            zIndex: 1,
            borderRadius: 8,
            color: '#999',
            fontSize: 14,
          }}
        >
          加载评论中…
        </div>
      )}
      <div ref={containerRef} />
    </div>
  );
}
