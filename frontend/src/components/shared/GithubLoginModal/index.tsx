import React, { useEffect } from 'react';
import { message } from 'antd';
import { useModel } from 'umi';
import { getOAuthReturnPath } from '@/utils/runtimePath';

const GithubLoginModal: React.FC = () => {
  const { loginModalVisible, setLoginModalVisible } = useModel('githubUserModel');

  useEffect(() => {
    if (loginModalVisible) {
      message.info({
        content: '正在跳转到 GitHub 授权...',
        duration: 2,
        style: {
          marginTop: '80vh',
        },
      });
      const returnUrl = encodeURIComponent(getOAuthReturnPath());
      setTimeout(() => {
        window.location.href = `/api/github/login?returnUrl=${returnUrl}`;
      }, 300);
      setLoginModalVisible(false);
    }
  }, [loginModalVisible, setLoginModalVisible]);

  return null;
};

export default GithubLoginModal;
