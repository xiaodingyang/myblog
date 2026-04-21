import React, { useEffect } from 'react';
import { message } from 'antd';
import { useModel } from 'umi';
import { getOAuthReturnPath } from '@/utils/runtimePath';
import { buildApiUrl } from '@/utils/apiBase';

const GithubLoginModal: React.FC = () => {
  const { loginModalVisible, setLoginModalVisible } = useModel('githubUserModel');

  useEffect(() => {
    if (loginModalVisible) {
      const isDev = process.env.NODE_ENV === 'development';
      
      // 开发环境：使用测试用户，不跳转 GitHub
      if (isDev) {
        message.success({
          content: '开发模式：已使用测试用户登录',
          duration: 2,
          style: {
            marginTop: '80vh',
          },
        });
        
        // 模拟 GitHub 用户数据
        const mockUser = {
          id: 999,
          login: 'dev-user',
          name: '开发测试用户',
          avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=dev-user',
          email: 'dev@test.com',
          bio: '这是开发环境的测试用户',
        };
        
        // 保存到 localStorage
        localStorage.setItem('github_user', JSON.stringify(mockUser));
        localStorage.setItem('github_token', 'dev-test-token-' + Date.now());
        
        // 触发页面刷新以更新用户状态
        setTimeout(() => {
          window.location.reload();
        }, 500);
        
        setLoginModalVisible(false);
        return;
      }
      
      // 生产环境：正常跳转 GitHub
      message.info({
        content: '正在跳转到 GitHub 授权...',
        duration: 2,
        style: {
          marginTop: '80vh',
        },
      });
      const returnUrl = encodeURIComponent(getOAuthReturnPath());
      setTimeout(() => {
        const loginUrl = buildApiUrl('/api/github/login');
        window.location.href = `${loginUrl}?returnUrl=${returnUrl}`;
      }, 300);
      setLoginModalVisible(false);
    }
  }, [loginModalVisible, setLoginModalVisible]);

  return null;
};

export default GithubLoginModal;
