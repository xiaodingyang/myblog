import React, { useEffect, useRef } from 'react';
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
  // 注意：微应用默认端口 8002，如端口被占用会自动递增
  return '//localhost:8005/myblog-comment-mf';
};

export default function MicroComment({ articleId, token, username }: MicroCommentProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const microAppRef = useRef<MicroApp | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // 加载微应用
    microAppRef.current = loadMicroApp({
      name: 'commentApp',
      entry: getMicroAppEntry(),
      container: containerRef.current,
      props: { articleId, token, username },
    });

    return () => {
      microAppRef.current?.unmount();
    };
  }, [articleId, token, username]);

  return <div ref={containerRef} />;
}
