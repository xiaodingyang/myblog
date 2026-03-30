import React, { useState } from 'react';
import { Modal, Button, Typography, Space, Divider } from 'antd';
import { GithubOutlined, CommentOutlined, ShareAltOutlined, CopyOutlined, LoadingOutlined } from '@ant-design/icons';
import { useModel } from 'umi';
import { getColorThemeById } from '@/config/colorThemes';

const { Title, Text, Paragraph } = Typography;

const GithubLoginModal: React.FC = () => {
  const { loginModalVisible, setLoginModalVisible } = useModel('githubUserModel');
  const { themeId } = useModel('colorModel');
  const theme = getColorThemeById(themeId);
  const [loginLoading, setLoginLoading] = useState(false);

  const handleGithubLogin = () => {
    setLoginLoading(true);
    const returnUrl = encodeURIComponent(window.location.pathname + window.location.search);
    window.location.href = `/api/github/login?returnUrl=${returnUrl}`;
  };

  return (
    <Modal
      open={loginModalVisible}
      onCancel={() => { setLoginModalVisible(false); setLoginLoading(false); }}
      afterOpenChange={(open) => { if (!open) setLoginLoading(false); }}
      footer={null}
      centered
      width={420}
      styles={{
        body: { padding: '32px 24px' },
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: 16,
            backgroundImage: theme.gradient,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
          }}
        >
          <GithubOutlined style={{ fontSize: 32, color: '#fff' }} />
        </div>

        <Title level={4} style={{ marginBottom: 8, color: theme.primary }}>
          登录后解锁更多功能
        </Title>

        <Paragraph type="secondary" style={{ marginBottom: 24 }}>
          使用 GitHub 账号快速登录，即可体验以下功能
        </Paragraph>

        <div
          style={{
            background: `${theme.primary}0a`,
            borderRadius: 12,
            padding: '16px 20px',
            marginBottom: 24,
            textAlign: 'left',
            border: `1px solid ${theme.primary}15`,
          }}
        >
          <Space direction="vertical" size={12} style={{ width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <CommentOutlined style={{ fontSize: 18, color: theme.primary }} />
              <Text>发表文章评论和留言</Text>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <CopyOutlined style={{ fontSize: 18, color: theme.primary }} />
              <Text>复制文章内容</Text>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <ShareAltOutlined style={{ fontSize: 18, color: theme.primary }} />
              <Text>分享文章链接</Text>
            </div>
          </Space>
        </div>

        <Button
          type="primary"
          size="large"
          icon={loginLoading ? <LoadingOutlined /> : <GithubOutlined />}
          onClick={handleGithubLogin}
          loading={loginLoading}
          disabled={loginLoading}
          style={{
            width: '100%',
            height: 48,
            fontSize: 16,
            backgroundImage: theme.gradient,
            border: 'none',
            borderRadius: 10,
          }}
        >
          {loginLoading ? '正在跳转 GitHub ...' : '使用 GitHub 登录'}
        </Button>

        <Divider plain>
          <Text type="secondary" style={{ fontSize: 12 }}>
            仅获取基本个人信息，不会操作你的仓库
          </Text>
        </Divider>

        <Button
          type="link"
          onClick={() => setLoginModalVisible(false)}
          style={{ color: '#999' }}
        >
          暂不登录，继续浏览
        </Button>
      </div>
    </Modal>
  );
};

export default GithubLoginModal;
