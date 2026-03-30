import React, { useEffect, useRef } from 'react';
import { loadMicroApp } from 'qiankun';
import type { MicroApp } from 'qiankun';

interface MicroCommentProps {
  articleId: string;
  token?: string;
  username?: string;
}

export default function MicroComment({ articleId, token, username }: MicroCommentProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const microAppRef = useRef<MicroApp | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // 加载微应用
    microAppRef.current = loadMicroApp({
      name: 'commentApp',
      entry: '//localhost:8002/myblog-comment-mf',
      container: containerRef.current,
      props: { articleId, token, username },
    });

    return () => {
      microAppRef.current?.unmount();
    };
  }, [articleId, token, username]);

  return <div ref={containerRef} />;
}
