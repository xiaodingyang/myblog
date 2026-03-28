import React from 'react';
import { Typography } from 'antd';
import CommentSection from '@/components/CommentSection';
import { ThemeProvider } from '@/contexts/ThemeContext';

const { Title } = Typography;

export default function HomePage() {
  // 开发环境模拟数据
  const isDev = process.env.NODE_ENV === 'development';
  const testArticleId = '6766e0e5e4b0a1234567890a';
  const testToken = isDev ? 'dev-token' : undefined;
  const testUsername = isDev ? '开发测试用户' : undefined;

  return (
    <ThemeProvider>
      <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
        <Title level={2}>评论系统微前端子应用</Title>
        <p>React 19 + qiankun 微前端</p>
        
        <div style={{ marginTop: 24 }}>
          <CommentSection
            articleId={testArticleId}
            token={testToken}
            username={testUsername}
          />
        </div>
      </div>
    </ThemeProvider>
  );
}
