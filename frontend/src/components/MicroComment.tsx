import React, { useEffect, useRef, useState } from 'react';
import { loadMicroApp } from 'qiankun';
import type { MicroApp } from 'qiankun';

interface MicroCommentProps {
  articleId: string;
  token?: string;
  username?: string;
}

// 获取微应用入口地址，根据环境自动切换
const getMicroAppEntry = (): string => {
  // 生产环境使用相对路径，通过 nginx 转发到微应用端口
  if (process.env.NODE_ENV === 'production') {
    return '/myblog-comment-mf';
  }
  // 开发环境使用 localhost（确保微应用已启动）
  return '//localhost:8005/myblog-comment-mf';
};

export default function MicroComment({ articleId, token, username }: MicroCommentProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const microAppRef = useRef<MicroApp | null>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!containerRef.current) return;

    // 防止重复加载
    if (microAppRef.current) {
      microAppRef.current.unmount();
    }

    setLoading(true);
    setError(false);

    try {
      // 加载微应用
      microAppRef.current = loadMicroApp({
        name: 'commentApp',
        entry: getMicroAppEntry(),
        container: containerRef.current,
        props: { articleId, token, username },
      }, {
        // qiankun 全局配置
        onGlobalStateChange: () => {},
        init: {},
      });

      microAppRef.current
        .loadPromise
        .then(() => {
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
        });

      // 监听微应用错误
      microAppRef.current.addGlobalErrorHandler((err) => {
        console.error('[MicroComment] Micro app error:', err);
        setError(true);
        setLoading(false);
      });
    } catch (err) {
      console.error('[MicroComment] Failed to load micro app:', err);
      setError(true);
      setLoading(false);
    }

    return () => {
      if (microAppRef.current) {
        microAppRef.current.unmount();
        microAppRef.current = null;
      }
    };
  }, [articleId, token, username]);

  // 如果微应用加载失败，显示降级UI
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

  return <div ref={containerRef} />;
}
