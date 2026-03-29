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
  return '//localhost:8002/myblog-comment-mf';
};

export default function MicroComment({ articleId, token, username }: MicroCommentProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const microAppRef = useRef<MicroApp | null>(null);
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
    setLoading(true);
    setError(false);
    lastPushedPropsRef.current = null;

    try {
      microAppRef.current = loadMicroApp({
        name: 'commentApp',
        entry: getMicroAppEntry(),
        container: containerRef.current,
        props: { articleId, token, username },
      });

      microAppRef.current
        .mountPromise
        .then(() => {
          if (cancelled) return;
          setLoading(false);
          lastPushedPropsRef.current = { articleId, token, username };
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
      if (microAppRef.current) {
        try { microAppRef.current.unmount(); } catch {}
        microAppRef.current = null;
      }
    };
  }, [articleId]);

  useEffect(() => {
    if (!microAppRef.current?.update) return;
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
