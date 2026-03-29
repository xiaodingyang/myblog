import React from 'react';
import CommentSection from '@/components/CommentSection';

export function rootContainer(container: any, props: any) {
  // qiankun 传递的 props
  const { articleId, token, username } = props;

  return React.createElement(CommentSection, {
    articleId: articleId || '6766e0e5e4b0a1234567890a',
    token,
    username,
  });
}
