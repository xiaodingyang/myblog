import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Badge, Popover, List, Typography, Button, Space, Empty } from 'antd';
import { BellOutlined, CheckOutlined, MessageOutlined } from '@ant-design/icons';
import { request, history } from 'umi';
import { useModel } from 'umi';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/zh-cn';

dayjs.extend(relativeTime);
dayjs.locale('zh-cn');

const { Text } = Typography;

interface NotificationItem {
  _id: string;
  type: string;
  fromUser?: { username: string; nickname?: string; avatar?: string };
  articleId?: { _id: string; title: string };
  content?: string;
  isRead: boolean;
  createdAt: string;
}

const NotificationBell: React.FC = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const { githubToken } = useModel('githubUserModel');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchUnreadCount = useCallback(async () => {
    if (!githubToken) return;
    try {
      const res = await request('/api/notifications/unread-count', {
        headers: { Authorization: `Bearer ${githubToken}` },
      });
      if (res.code === 0) {
        setUnreadCount(res.data.count);
      }
    } catch {
      // ignore
    }
  }, [githubToken]);

  const fetchNotifications = useCallback(async () => {
    if (!githubToken) return;
    setLoading(true);
    try {
      const res = await request('/api/notifications', {
        params: { page: 1, pageSize: 5 },
        headers: { Authorization: `Bearer ${githubToken}` },
      });
      if (res.code === 0) {
        setNotifications(res.data.list || []);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [githubToken]);

  const markAsRead = async (id: string) => {
    if (!githubToken) return;
    try {
      await request(`/api/notifications/${id}/read`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${githubToken}` },
      });
      setNotifications(prev =>
        prev.map(n => (n._id === id ? { ...n, isRead: true } : n)),
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch {
      // ignore
    }
  };

  const markAllRead = async () => {
    if (!githubToken) return;
    try {
      await request('/api/notifications/read-all', {
        method: 'PUT',
        headers: { Authorization: `Bearer ${githubToken}` },
      });
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {
      // ignore
    }
  };

  // 初始化 + 轮询
  useEffect(() => {
    fetchUnreadCount();
    intervalRef.current = setInterval(fetchUnreadCount, 30 * 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchUnreadCount]);

  // Popover 打开时加载列表
  useEffect(() => {
    if (popoverOpen) fetchNotifications();
  }, [popoverOpen, fetchNotifications]);

  const getNotificationText = (item: NotificationItem) => {
    const name = item.fromUser?.nickname || item.fromUser?.username || '某用户';
    if (item.type === 'reply') return `${name} 回复了你的评论`;
    if (item.type === 'like') return `${name} 点赞了你的评论`;
    return `${name} 给你发了通知`;
  };

  const content = (
    <div style={{ width: 320 }}>
      <List
        loading={loading}
        dataSource={notifications}
        locale={{
          emptyText: <Empty description="暂无通知" image={Empty.PRESENTED_IMAGE_SIMPLE} />,
        }}
        renderItem={(item) => (
          <List.Item
            style={{
              padding: '10px 8px',
              cursor: 'pointer',
              background: item.isRead ? 'transparent' : 'rgba(59, 130, 246, 0.04)',
              borderRadius: 8,
            }}
            onClick={() => {
              if (!item.isRead) markAsRead(item._id);
              if (item.articleId?._id) {
                setPopoverOpen(false);
                history.push(`/article/${item.articleId._id}`);
              }
            }}
          >
            <List.Item.Meta
              avatar={
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: item.isRead ? '#f3f4f6' : '#eff6ff',
                  }}
                >
                  <MessageOutlined style={{ color: item.isRead ? '#9ca3af' : '#3b82f6' }} />
                </div>
              }
              title={
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ fontSize: 13, fontWeight: item.isRead ? 400 : 500 }}>
                    {getNotificationText(item)}
                  </Text>
                  {!item.isRead && (
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#3b82f6', flexShrink: 0 }} />
                  )}
                </div>
              }
              description={
                <div>
                  {item.content && (
                    <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>
                      "{item.content.slice(0, 40)}{item.content.length > 40 ? '...' : ''}"
                    </Text>
                  )}
                  <Text type="secondary" style={{ fontSize: 11 }}>
                    {dayjs(item.createdAt).fromNow()}
                    {item.articleId?.title && ` · ${item.articleId.title.slice(0, 15)}${item.articleId.title.length > 15 ? '...' : ''}`}
                  </Text>
                </div>
              }
            />
          </List.Item>
        )}
      />
      {notifications.length > 0 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 4px 0', borderTop: '1px solid #f0f0f0' }}>
          <Button type="link" size="small" onClick={markAllRead} icon={<CheckOutlined />}>
            全部已读
          </Button>
        </div>
      )}
    </div>
  );

  return (
    <Popover
      content={content}
      title={
        <span style={{ fontWeight: 600, fontSize: 14 }}>
          🔔 通知 {unreadCount > 0 && <Text type="secondary" style={{ fontSize: 12 }}>({unreadCount} 条未读)</Text>}
        </span>
      }
      trigger="click"
      open={popoverOpen}
      onOpenChange={setPopoverOpen}
      placement="bottomRight"
    >
      <Badge count={unreadCount} size="small" offset={[-2, 2]}>
        <BellOutlined
          style={{
            fontSize: 18,
            cursor: 'pointer',
            color: unreadCount > 0 ? '#3b82f6' : undefined,
            transition: 'color 0.2s',
          }}
        />
      </Badge>
    </Popover>
  );
};

export default NotificationBell;
