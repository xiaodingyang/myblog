import React from 'react';
import { Modal, Typography, Space, Progress, Empty } from 'antd';
import { TrophyOutlined, FireOutlined, ReadOutlined } from '@ant-design/icons';
import { getReadingStats, getUnlockedAchievements, getAllMilestones } from '@/utils/achievements';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/zh-cn';
import { BORDER_RADIUS, SPACING, FONT_SIZE } from '@/styles/designTokens';

dayjs.extend(relativeTime);
dayjs.locale('zh-cn');

const { Title, Text } = Typography;

interface ReadingStatsProps {
  open: boolean;
  onClose: () => void;
}

const ReadingStatsModal: React.FC<ReadingStatsProps> = ({ open, onClose }) => {
  const stats = getReadingStats();
  const unlocked = getUnlockedAchievements();
  const allMilestones = getAllMilestones();
  const unlockedIds = new Set(unlocked.map(a => a.id));

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      title={
        <span style={{ fontSize: FONT_SIZE.ICON_MEDIUM, fontWeight: 600 }}>
          <TrophyOutlined style={{ marginRight: 8, color: '#f59e0b' }} />
          阅读统计
        </span>
      }
      width={480}
      destroyOnClose
    >
      {/* Stats cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 24 }}>
        <div style={{ textAlign: 'center', padding: 16, background: '#f0f9ff', borderRadius: BORDER_RADIUS.CARD_LARGE }}>
          <ReadOutlined style={{ fontSize: 24, color: '#3b82f6', marginBottom: 4 }} />
          <div style={{ fontSize: 28, fontWeight: 700, color: '#1e40af' }}>{stats.totalArticles}</div>
          <Text type="secondary" style={{ fontSize: FONT_SIZE.BODY_SMALL }}>已读文章</Text>
        </div>
        <div style={{ textAlign: 'center', padding: 16, background: '#fef3c7', borderRadius: BORDER_RADIUS.CARD_LARGE }}>
          <FireOutlined style={{ fontSize: 24, color: '#f59e0b', marginBottom: 4 }} />
          <div style={{ fontSize: 28, fontWeight: 700, color: '#92400e' }}>{stats.streakDays}</div>
          <Text type="secondary" style={{ fontSize: FONT_SIZE.BODY_SMALL }}>连续天数</Text>
        </div>
        <div style={{ textAlign: 'center', padding: 16, background: '#f0fdf4', borderRadius: BORDER_RADIUS.CARD_LARGE }}>
          <TrophyOutlined style={{ fontSize: 24, color: '#22c55e', marginBottom: 4 }} />
          <div style={{ fontSize: 28, fontWeight: 700, color: '#166534' }}>{unlocked.length}</div>
          <Text type="secondary" style={{ fontSize: FONT_SIZE.BODY_SMALL }}>已解锁</Text>
        </div>
      </div>

      {/* Achievements */}
      <Title level={5} style={{ marginBottom: 12 }}>🏆 成就列表</Title>
      {allMilestones.length === 0 ? (
        <Empty description="暂无成就" image={Empty.PRESENTED_IMAGE_SIMPLE} />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {allMilestones.map(m => {
            const isUnlocked = unlockedIds.has(m.id);
            const unlockedItem = unlocked.find(a => a.id === m.id);
            return (
              <div
                key={m.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '10px 14px',
                  borderRadius: BORDER_RADIUS.CARD_MEDIUM,
                  background: isUnlocked ? '#fefce8' : '#f9fafb',
                  border: `1px solid ${isUnlocked ? '#fde68a' : '#f3f4f6'}`,
                  opacity: isUnlocked ? 1 : 0.5,
                }}
              >
                <span style={{ fontSize: 24 }}>{(m as any).icon || '🏅'}</span>
                <div style={{ flex: 1 }}>
                  <Text strong style={{ fontSize: FONT_SIZE.HEADING_SMALL }}>{m.title}</Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: FONT_SIZE.BODY_SMALL }}>{m.desc}</Text>
                </div>
                {isUnlocked ? (
                  <Text style={{ fontSize: FONT_SIZE.CAPTION, color: '#16a34a' }}>
                    ✅ {dayjs(unlockedItem!.unlockedAt).fromNow()}
                  </Text>
                ) : (
                  <Text type="secondary" style={{ fontSize: FONT_SIZE.CAPTION }}>🔒 未解锁</Text>
                )}
              </div>
            );
          })}
        </div>
      )}
    </Modal>
  );
};

export default ReadingStatsModal;
