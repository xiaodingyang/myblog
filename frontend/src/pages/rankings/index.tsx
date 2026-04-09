import React, { useEffect, useState } from 'react';
import { Avatar, Typography, List, Tag, Space } from 'antd';
import { TrophyOutlined, CommentOutlined, CrownOutlined } from '@ant-design/icons';
import { request, useModel } from 'umi';
import { getColorThemeById } from '@/config/colorThemes';
import { themeBg } from '@/utils/themeHelpers';
import Empty from '@/components/shared/Empty';
import useSEO from '@/hooks/useSEO';
import ScrollReveal from '@/components/visual/ScrollReveal';

const { Title, Text } = Typography;

interface RankUser {
  rank: number;
  userId: string;
  username: string;
  nickname: string;
  avatar: string;
  htmlUrl: string;
  commentCount: number;
  latestCommentTime: string;
}

const getRankIcon = (rank: number) => {
  if (rank === 1) return '🥇';
  if (rank === 2) return '🥈';
  if (rank === 3) return '🥉';
  return null;
};

// 骨架屏
const RankingSkeleton: React.FC = () => (
  <div className="space-y-3">
    {[1, 2, 3, 4, 5, 6].map((i) => (
      <div key={i} className="flex items-center gap-4 p-4 rounded-xl">
        <div className="w-12 h-12 rounded-full bg-white/10 animate-pulse flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-5 w-32 rounded bg-white/10 animate-pulse" />
          <div className="h-4 w-48 rounded bg-white/6 animate-pulse" />
        </div>
        <div className="h-6 w-16 rounded-full bg-white/6 animate-pulse flex-shrink-0" />
      </div>
    ))}
  </div>
);

const Rankings: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [list, setList] = useState<RankUser[]>([]);
  const { themeId: colorThemeId } = useModel('colorModel');
  const currentColorTheme = getColorThemeById(colorThemeId);

  const seo = useSEO({
    title: '评论活跃榜',
    description: '若风博客评论活跃排行榜，看看谁是最活跃的读者！',
    keywords: '排行榜,评论,活跃用户',
  });

  useEffect(() => {
    const fetchRankings = async () => {
      setLoading(true);
      try {
        const res = await request<API.Response<RankUser[]>>('/api/rankings/comments', {
          params: { limit: 20 },
        });
        if (res.code === 0) {
          setList(res.data || []);
        }
      } catch (error) {
        // handled
      } finally {
        setLoading(false);
      }
    };
    fetchRankings();
  }, []);

  const getRankBadge = (rank: number) => {
    const colors: Record<number, { bg: string; text: string; label: string }> = {
      1: { bg: 'linear-gradient(135deg, #ffd700, #ffb800)', text: '#7a5a00', label: '金冠' },
      2: { bg: 'linear-gradient(135deg, #c0c0c0, #a8a8a8)', text: '#555', label: '银冠' },
      3: { bg: 'linear-gradient(135deg, #cd7f32, #b8722d)', text: '#fff', label: '铜冠' },
    };
    if (colors[rank]) {
      return (
        <span
          className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold"
          style={{ background: colors[rank].bg, color: colors[rank].text }}
        >
          {getRankIcon(rank)} {colors[rank].label}
        </span>
      );
    }
    return (
      <span
        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
        style={{
          background: `${currentColorTheme.primary}15`,
          color: currentColorTheme.primary,
        }}
      >
        #{rank}
      </span>
    );
  };

  return (
    <div className="animate-fade-in py-8">
      {seo}
      <div className="max-w-3xl mx-auto px-4 md:px-6">
        {/* 页面标题 */}
        <ScrollReveal direction="up">
        <div className="text-center mb-12">
          <div
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
            style={{ background: currentColorTheme.gradient }}
          >
            <TrophyOutlined className="text-3xl text-white" />
          </div>
          <Title
            level={1}
            className="!mb-3 !text-white"
            style={{ textShadow: '0 2px 24px rgba(0, 0, 0, 0.45)' }}
          >
            评论活跃榜
          </Title>
          <Text
            className="!text-white/85 text-lg"
            style={{ textShadow: '0 1px 12px rgba(0, 0, 0, 0.35)' }}
          >
            感谢每一位活跃的读者
          </Text>
        </div>
        </ScrollReveal>

        {/* 内容区域 */}
        <div
          className="p-5 md:p-8 rounded-2xl relative z-10"
          style={{
            minHeight: 300,
            background: themeBg(currentColorTheme.primary, 0.12),
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid ' + themeBg(currentColorTheme.primary, 0.18),
            boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
          }}
        >
          {loading ? (
            <RankingSkeleton />
          ) : list.length === 0 ? (
            <Empty description="暂无数据，快来抢沙发吧！" />
          ) : (
            <div className="space-y-2">
              {list.map((item, index) => {
                const isTop3 = item.rank <= 3;
                return (
                  <ScrollReveal key={item.userId} direction="up" delay={index * 0.06}>
                  <div
                    key={item.userId}
                    className="flex items-center gap-4 p-4 rounded-xl transition-colors hover:bg-white/8"
                    style={
                      isTop3
                        ? { background: `${currentColorTheme.primary}10`, border: `1px solid ${currentColorTheme.primary}18` }
                        : { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }
                    }
                  >
                    {/* 头像 */}
                    <div className="relative flex-shrink-0">
                      {isTop3 && (
                        <div className="absolute -top-2 left-1/2 -translate-x-1/2 text-lg z-10">
                          {getRankIcon(item.rank)}
                        </div>
                      )}
                      <Avatar
                        src={item.avatar}
                        size={isTop3 ? 52 : 44}
                        className={isTop3 ? 'mt-2' : ''}
                        style={
                          isTop3
                            ? {
                                border: `2px solid ${currentColorTheme.primary}40`,
                                boxShadow: `0 4px 12px ${currentColorTheme.primary}20`,
                              }
                            : undefined
                        }
                      />
                    </div>

                    {/* 信息 */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <a
                          href={item.htmlUrl || `https://github.com/${item.username}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-semibold text-white/90 hover:underline truncate"
                          style={isTop3 ? { color: currentColorTheme.primary } : undefined}
                        >
                          {item.nickname || item.username}
                        </a>
                        {getRankBadge(item.rank)}
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-sm text-white/60">
                        <span>
                          <CommentOutlined className="mr-1" />
                          {item.commentCount} 条评论
                        </span>
                        {item.latestCommentTime && (
                          <span className="text-xs">
                            最近：{new Date(item.latestCommentTime).toLocaleDateString('zh-CN')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  </ScrollReveal>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Rankings;
