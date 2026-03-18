import React from 'react';
import { Modal, Button, Typography, Space, Divider } from 'antd';
import { GithubOutlined, CommentOutlined, ShareAltOutlined, CopyOutlined } from '@ant-design/icons';
import { useModel } from 'umi';

const { Title, Text, Paragraph } = Typography;

const GithubLoginModal: React.FC = () => {
  const { loginModalVisible, setLoginModalVisible } = useModel('githubUserModel');

  const handleGithubLogin = () => {
    const returnUrl = encodeURIComponent(window.location.pathname + window.location.search);
    window.location.href = `/api/github/login?returnUrl=${returnUrl}`;
  };

  return (
    <Modal
      open={loginModalVisible}
      onCancel={() => setLoginModalVisible(false)}
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
            background: 'linear-gradient(135deg, #24292e 0%, #586069 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
          }}
        >
          <GithubOutlined style={{ fontSize: 32, color: '#fff' }} />
        </div>

        <Title level={4} style={{ marginBottom: 8 }}>
          登录后解锁更多功能
        </Title>

        <Paragraph type="secondary" style={{ marginBottom: 24 }}>
          使用 GitHub 账号快速登录，即可体验以下功能
        </Paragraph>

        <div
          style={{
            background: '#f8f9fa',
            borderRadius: 12,
            padding: '16px 20px',
            marginBottom: 24,
            textAlign: 'left',
          }}
        >
          <Space direction="vertical" size={12} style={{ width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <CommentOutlined style={{ fontSize: 18, color: '#1677ff' }} />
              <Text>发表文章评论和留言</Text>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <CopyOutlined style={{ fontSize: 18, color: '#52c41a' }} />
              <Text>复制文章内容</Text>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <ShareAltOutlined style={{ fontSize: 18, color: '#722ed1' }} />
              <Text>分享文章链接</Text>
            </div>
          </Space>
        </div>

        <Button
          type="primary"
          size="large"
          icon={<GithubOutlined />}
          onClick={handleGithubLogin}
          style={{
            width: '100%',
            height: 48,
            fontSize: 16,
            background: '#24292e',
            borderColor: '#24292e',
            borderRadius: 10,
          }}
        >
          使用 GitHub 登录
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
