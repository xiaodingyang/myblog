import React from 'react';
import { Modal, Button, Typography, Space, Divider } from 'antd';
import {
  GithubOutlined,
  CommentOutlined,
  ShareAltOutlined,
  CopyOutlined,
  HeartOutlined,
  StarOutlined,
  TrophyOutlined,
} from '@ant-design/icons';
import { useModel } from 'umi';
import { getColorThemeById } from '@/config/colorThemes';

const { Title, Text, Paragraph } = Typography;

const GithubLoginModal: React.FC = () => {
  const { loginModalVisible, setLoginModalVisible } = useModel('githubUserModel');
  const { themeId } = useModel('colorModel');
  const theme = getColorThemeById(themeId);

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
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <HeartOutlined style={{ fontSize: 18, color: theme.primary }} />
              <Text>为文章点赞、为评论互动</Text>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <StarOutlined style={{ fontSize: 18, color: theme.primary }} />
              <Text>收藏文章，建立个人书单</Text>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <TrophyOutlined style={{ fontSize: 18, color: theme.primary }} />
              <Text>查看排行榜与更多互动数据</Text>
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
            backgroundImage: theme.gradient,
            border: 'none',
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
