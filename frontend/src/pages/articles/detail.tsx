import React, { useEffect, useState, useMemo, useRef, lazy, Suspense } from 'react';
import { useParams, Link, history } from 'umi';
import { Typography, Tag, Space, Avatar, Divider, Card, Button, Input, List, Pagination, message, Spin } from 'antd';
import { useModel } from 'umi';
import { getColorThemeById } from '@/config/colorThemes';
import {
  ClockCircleOutlined,
  EyeOutlined,
  FolderOutlined,
  TagOutlined,
  UserOutlined,
  ArrowLeftOutlined,
  GithubOutlined,
  HeartOutlined,
  HeartFilled,
  StarOutlined,
  StarFilled,
  CommentOutlined,
} from '@ant-design/icons';
import { request } from 'umi';
import dayjs from 'dayjs';
import Empty from '@/components/shared/Empty';
import ShareButton from '@/components/shared/ShareButton';
import CopyPageUrlButton from '@/components/shared/CopyPageUrlButton';
import ArticleToc from '@/components/article/ArticleToc';
const LazyMarkdownBody = lazy(() => import('@/components/article/MarkdownArticleBody'));
import ArticleReactions from '@/components/article/ArticleReactions';
import RelatedArticles from '@/components/article/RelatedArticles';
import SeriesNav from '@/components/article/SeriesNav';
import ArticleDetailSkeleton from '@/components/layout/Skeleton/ArticleDetailSkeleton';
import Breadcrumb from '@/components/layout/Breadcrumb';
import { addReadingHistory } from '@/components/reading/ReadingHistory';
import { checkAchievements } from '@/utils/achievements';
import Lightbox from '@/components/shared/Lightbox';
import { useLightbox } from '@/hooks/useLightbox';
import useSEO from '@/hooks/useSEO';
import { useArticle, useComments } from '@/hooks/useQueries';
import { useQueryClient } from '@tanstack/react-query';
import { extractTocFromMarkdown } from '@/utils/markdownToc';
import { estimateReadingMinutes } from '@/utils/readingTime';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

function formatViews(views: number): string {
  if (views >= 10000) return (views / 10000).toFixed(1).replace(/\.0$/, '') + 'w';
  if (views >= 1000) return (views / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
  return String(views);
}

const ArticleDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { data: article, isLoading: loading } = useArticle(id!);
  const { themeId: colorThemeId } = useModel('colorModel');
  const currentColorTheme = getColorThemeById(colorThemeId);
  const [commentPage, setCommentPage] = useState(1);
  const { data: commentsData, isLoading: commentLoading } = useComments(id!, commentPage);
  const comments = commentsData?.list ?? [];
  const commentTotal = commentsData?.total ?? 0;

  // Lightbox for article images
  const lightbox = useLightbox('.markdown-body', [article]);
  const { githubUser, githubToken, isLoggedIn, requireAuth } = useModel('githubUserModel');
  const [likingComments, setLikingComments] = useState<Set<string>>(new Set());
  const [articleLikeLoading, setArticleLikeLoading] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [showCommentButton, setShowCommentButton] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [commentContent, setCommentContent] = useState('');
  const commentPageSize = 10;
  const commentsRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const toc = useMemo(
    () => (article ? extractTocFromMarkdown(article.content) : []),
    [article?.content],
  );

  const readingMinutes = useMemo(
    () => (article ? estimateReadingMinutes(article.content) : 0),
    [article?.content],
  );

  const jsonLd = useMemo(() => {
    if (!article) return undefined;
    return {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: article.title,
      description: article.summary || '',
      image: article.cover || undefined,
      datePublished: article.createdAt,
      dateModified: article.updatedAt,
      author: {
        '@type': 'Person',
        name: article.author?.username || '若风',
      },
      publisher: {
        '@type': 'Person',
        name: '若风',
      },
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': typeof window !== 'undefined' ? window.location.href : '',
      },
    };
  }, [article]);

  const seo = useSEO({
    title: article?.title,
    shareTitle: article?.title,
    description:
      article?.summary?.trim() ||
      `阅读若风的技术博客文章：${article?.title || ''}`,
    keywords: article?.tags?.map((t: any) => t.name).join(',') || '技术文章',
    ogImage: article?.cover,
    ogType: 'article',
    ogUrl: typeof window !== 'undefined' ? window.location.href.split('#')[0] : undefined,
    jsonLd,
  });

  // 记录阅读历史 + 检查成就（文章加载成功后触发）
  useEffect(() => {
    if (article && id) {
      addReadingHistory({
        articleId: id,
        title: article.title,
        cover: article.cover,
        summary: article.summary,
        readAt: new Date().toISOString(),
      });
      const ach = checkAchievements();
      if (ach) message.success(`🏆 成就解锁：${ach.title} — ${ach.desc}`, 3);
    }
  }, [article, id]);

  // Call view count API (separate effect to avoid re-calling on fetchComments changes)
  useEffect(() => {
    if (id) {
      request(`/api/articles/${id}/view`).catch(() => {});
    }
  }, [id]);

  // 监听滚动，显示/隐藏"跳到评论"按钮
  useEffect(() => {
    const handleScroll = () => {
      const commentsSection = commentsRef.current;
      if (!commentsSection) return;

      const rect = commentsSection.getBoundingClientRect();
      // 当评论区顶部在视口上方时显示按钮
      setShowCommentButton(rect.top > window.innerHeight);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // 初始化检查
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToComments = () => {
    commentsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Bug Fix #1: 确保在回调内部再次检查登录状态和 githubToken，防止竞态条件
  const handleSubmitComment = () => {
    requireAuth(async () => {
      // 二次检查：确保 githubToken 有效（防止 requireAuth 调用后 token 被清空的边缘情况）
      if (!isLoggedIn || !githubToken) {
        message.warning('请先登录后再发表评论');
        return;
      }
      if (!commentContent.trim() || commentContent.trim().length < 2) {
        message.warning('评论内容至少2个字符');
        return;
      }
      setSubmitting(true);
      try {
        const res = await request('/api/comments', {
          method: 'POST',
          headers: { Authorization: `Bearer ${githubToken}` },
          data: { articleId: id, content: commentContent.trim() },
        });
        if (res.code === 0) {
          message.success('评论发表成功');
          setCommentContent('');
          setCommentPage(1);
          queryClient.invalidateQueries({ queryKey: ['comments', id!, 1] });
        } else {
          message.error(res.message || '评论失败');
        }
      } catch {
        message.error('评论失败');
      } finally {
        setSubmitting(false);
      }
    });
  };

  // 点赞评论
  const handleLikeComment = (commentId: string) => {
    requireAuth(async () => {
      if (!isLoggedIn || !githubToken) {
        message.warning('请先登录后再点赞');
        return;
      }
      if (likingComments.has(commentId)) return;

      setLikingComments(prev => new Set(prev).add(commentId));

      // 乐观更新：先缓存中更新
      queryClient.setQueryData(['comments', id!, commentPage], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          list: old.list.map((c: any) => {
            if (c._id === commentId) {
              const userLikes = c.likes?.map((l: any) => l.toString()) || [];
              const isLiked = userLikes.includes(githubUser?.id?.toString());
              return {
                ...c,
                likeCount: isLiked ? Math.max(0, (c.likeCount || 0) - 1) : (c.likeCount || 0) + 1,
                liked: !isLiked,
              };
            }
            return c;
          }),
        };
      });

      try {
        const res = await request(`/api/comments/${commentId}/like`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${githubToken}` },
        });
        if (res.code === 0) {
          // 使用服务器返回值更新缓存
          queryClient.setQueryData(['comments', id!, commentPage], (old: any) => {
            if (!old) return old;
            return {
              ...old,
              list: old.list.map((c: any) =>
                c._id === commentId
                  ? { ...c, likeCount: res.data.likeCount, liked: res.data.liked }
                  : c
              ),
            };
          });
        } else {
          // 失败则使缓存失效，重新获取
          queryClient.invalidateQueries({ queryKey: ['comments', id!, commentPage] });
          message.error(res.message || '点赞失败');
        }
      } catch {
        queryClient.invalidateQueries({ queryKey: ['comments', id!, commentPage] });
        message.error('点赞失败');
      } finally {
        setLikingComments(prev => {
          const next = new Set(prev);
          next.delete(commentId);
          return next;
        });
      }
    });
  };

  const handleArticleLike = () => {
    requireAuth(async () => {
      if (!githubToken || !id) {
        message.warning('请先登录后再点赞');
        return;
      }
      setArticleLikeLoading(true);
      try {
        const res = await request(`/api/articles/${id}/like`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${githubToken}` },
        });
        if (res.code === 0 && res.data) {
          queryClient.setQueryData(['article', id], (old: any) =>
            old ? { ...old, liked: res.data.liked, likeCount: res.data.likeCount } : old
          );
        } else {
          message.error(res.message || '操作失败');
        }
      } catch {
        message.error('操作失败');
      } finally {
        setArticleLikeLoading(false);
      }
    });
  };

  const handleToggleFavorite = () => {
    requireAuth(async () => {
      if (!githubToken || !id) {
        message.warning('请先登录后再收藏');
        return;
      }
      setFavoriteLoading(true);
      const was = article?.favorited;
      try {
        if (was) {
          const res = await request(`/api/favorites/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${githubToken}` },
          });
          if (res.code === 0) {
            queryClient.setQueryData(['article', id], (old: any) =>
              old ? { ...old, favorited: false } : old
            );
            message.success('已取消收藏');
          } else {
            message.error(res.message || '取消收藏失败');
          }
        } else {
          const res = await request('/api/favorites', {
            method: 'POST',
            headers: { Authorization: `Bearer ${githubToken}` },
            data: { articleId: id },
          });
          if (res.code === 0) {
            queryClient.setQueryData(['article', id], (old: any) =>
              old ? { ...old, favorited: true } : old
            );
            message.success('已加入收藏');
          } else {
            message.error(res.message || '收藏失败');
          }
        }
      } catch {
        message.error('操作失败');
      } finally {
        setFavoriteLoading(false);
      }
    });
  };

  if (loading) {
    return <ArticleDetailSkeleton />;
  }

  if (!article) {
    return (
      <div className="py-16">
        <Empty
          description="文章不存在或已删除"
          showAction
          actionText="返回文章列表"
          actionLink="/articles"
        />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {seo}
      {/* Skip to content */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[9999] focus:bg-white focus:px-4 focus:py-2 focus:rounded focus:shadow-lg"
      >
        跳到主内容
      </a>
      {/* 文章头部 */}
      <section
        className="relative py-16 md:py-24 overflow-hidden"
        style={{
          background: article.cover
            ? `linear-gradient(rgba(15, 23, 42, 0.8), rgba(15, 23, 42, 0.9)), url(${article.cover}) center/cover no-repeat`
            : 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        }}
      >
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <Breadcrumb />

          {/* 返回按钮 - 玻璃质感 */}
          <button
            onClick={() => history.back()}
            className="group inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm text-white/80 mb-6 md:mb-8 transition-all duration-300 hover:text-white hover:scale-105"
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
            }}
          >
            <ArrowLeftOutlined className="transition-transform duration-300 group-hover:-translate-x-1" />
            返回
          </button>

          {/* 标题 */}
          <Title level={1} className="!text-white !mb-4" style={{ fontSize: 'clamp(1.5rem, 4vw, 2.5rem)' }}>
            {article.title}
          </Title>
          <div className="text-white/75 text-sm md:text-base mb-6">
            阅读时间约 {readingMinutes} 分钟
          </div>

          {/* 元信息 */}
          <div className="flex flex-wrap items-center gap-3 md:gap-6 text-white/70 text-sm md:text-base">
            <Space>
              <Avatar
                size={40}
                icon={<UserOutlined />}
                src={article.author?.avatar}
                style={{ background: currentColorTheme.primary }} // 主题色
              />
              <span>{article.author?.username || '匿名'}</span>
            </Space>
            <Space>
              <ClockCircleOutlined />
              <span>{dayjs(article.createdAt).format('YYYY年MM月DD日')}</span>
            </Space>
            <Space>
              <EyeOutlined />
              <span>{formatViews(article.views || 0)} 阅读</span>
            </Space>
          </div>

          {/* 分类 & 标签 */}
          <div className="mt-6 flex flex-wrap items-center gap-2">
            {/* 分类 */}
            <Link to={`/category/${article.category?._id}`}>
              <span
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm text-white/90 transition-all duration-300 hover:text-white hover:bg-white/20"
                style={{
                  background: 'rgba(255, 255, 255, 0.15)',
                  border: '1px solid rgba(255, 255, 255, 0.25)',
                }}
              >
                <FolderOutlined />
                {article.category?.name || '未分类'}
              </span>
            </Link>
            {/* 标签 */}
            {article.tags?.map(tag => (
              <Link key={tag._id} to={`/tag/${tag._id}`}>
                <Tag
                  className="!border-white/20 !bg-white/10 !text-white/80 hover:!bg-white/20 transition-colors !m-0"
                >
                  <TagOutlined className="mr-1" />
                  {tag.name}
                </Tag>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 文章内容 */}
      <section className="py-10 md:py-14">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-10 lg:items-start">
          <Card
            className="flex-1 min-w-0 w-full glass-card"
            style={{
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
            }}
          >
            <div className="markdown-body" id="main-content">
              <Suspense fallback={<div className="min-h-[200px]" />}><LazyMarkdownBody content={article.content} toc={toc} /></Suspense>
            </div>

            <Divider />

            <div className="flex flex-wrap items-center gap-4 justify-between">
              <Space wrap size="middle">
                <Button
                  type={article.liked ? 'primary' : 'default'}
                  danger={!!article.liked}
                  icon={article.liked ? <HeartFilled /> : <HeartOutlined />}
                  loading={articleLikeLoading}
                  onClick={handleArticleLike}
                >
                  {article.liked ? '已点赞' : '点赞文章'}{' '}
                  <span className="text-xs opacity-90">({article.likeCount ?? 0})</span>
                </Button>
                <Button
                  type={article.favorited ? 'primary' : 'default'}
                  icon={article.favorited ? <StarFilled /> : <StarOutlined />}
                  loading={favoriteLoading}
                  onClick={handleToggleFavorite}
                >
                  {article.favorited ? '已收藏' : '收藏'}
                </Button>
              </Space>
              <Space wrap className="flex items-center">
                <ArticleReactions articleId={article._id} />
                <Divider type="vertical" style={{ height: 24, margin: '0 4px' }} />
                <CopyPageUrlButton />
                <ShareButton
                  title={article.title}
                  summary={article.summary || ''}
                  cover={article.cover}
                />
              </Space>
            </div>
            <div className="mt-6">
              <Text className="text-gray-500 text-sm">
                最后更新于 {dayjs(article.updatedAt).format('YYYY-MM-DD HH:mm')}
              </Text>
            </div>
          </Card>

          <ArticleToc
            items={toc}
            primaryColor={currentColorTheme.primary}
            gradient={currentColorTheme.gradient}
          />
          </div>

          {/* 跳到评论浮动按钮 */}
          <Button
            shape="circle"
            size="large"
            icon={<CommentOutlined />}
            onClick={scrollToComments}
            className="!flex items-center justify-center"
            style={{
              position: 'fixed',
              bottom: 100,
              right: 24,
              zIndex: 100,
              opacity: showCommentButton ? 1 : 0,
              transform: showCommentButton ? 'scale(1)' : 'scale(0.8)',
              pointerEvents: showCommentButton ? 'auto' : 'none',
              transition: 'opacity 0.3s ease, transform 0.3s ease',
              background: currentColorTheme.gradient,
              color: '#fff',
              border: 'none',
              boxShadow: `0 4px 14px ${currentColorTheme.primary}55`,
            }}
            aria-label="跳到评论区"
          />

          {/* 评论区 + 相关推荐：lg 下为 fixed 目录预留与上方 flex（w-56 + gap-8）同宽的右侧空间，避免白底卡片盖住目录 */}
          <div className="lg:pr-[calc(14rem+2rem)]">
          {/* 评论区 */}
          <Card
            className="mt-10 glass-card"
            ref={commentsRef as any}
            style={{
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
            }}
          >
            <Title level={4} className="!mb-6">
              💬 评论 {commentTotal > 0 && `(${commentTotal})`}
            </Title>

            {/* 评论输入 */}
            <div className="mb-8">
              {isLoggedIn ? (
                <div className="flex gap-3">
                  <Avatar
                    size={40}
                    src={githubUser?.avatar}
                    icon={<GithubOutlined />}
                    style={{ flexShrink: 0 }}
                  />
                  <div className="flex-1">
                    <div style={{ marginBottom: 8 }}>
                      <TextArea
                        value={commentContent}
                        onChange={(e) => setCommentContent(e.target.value)}
                        placeholder="写下你的评论..."
                        rows={3}
                        showCount
                        maxLength={500}
                      />
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <Text type="secondary" className="text-sm">
                        以 <Text strong>{githubUser?.nickname || githubUser?.username}</Text> 的身份评论
                      </Text>
                      <Button
                        type="primary"
                        onClick={handleSubmitComment}
                        loading={submitting}
                      >
                        发表评论
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  className="text-center py-6 rounded-xl cursor-pointer transition-all hover:shadow-md"
                  style={{ background: '#f8f9fa', border: '1px dashed #d9d9d9' }}
                  onClick={() => requireAuth()}
                >
                  <GithubOutlined style={{ fontSize: 24, color: '#525252', marginBottom: 8 }} />
                  <div>
                    <Text type="secondary">登录 GitHub 后即可发表评论</Text>
                  </div>
                  <Button type="link" style={{ marginTop: 4 }}>
                    点击登录
                  </Button>
                </div>
              )}
            </div>

            {/* 评论列表 */}
            {commentLoading ? (
              <div style={{ textAlign: 'center', padding: 20 }}><Spin size="large" /></div>
            ) : comments.length > 0 ? (
              <>
                <List
                  itemLayout="horizontal"
                  dataSource={comments}
                  renderItem={(item, index) => {
                    const userLikes = item.likes?.map((l: any) => l.toString()) || [];
                    const isLiked = item.liked || userLikes.includes(githubUser?.id?.toString());
                    const likeCount = item.likeCount ?? (userLikes.length || 0);
                    const isLiking = likingComments.has(item._id);
                    return (
                      <List.Item
                        className="animate-slide-up !px-0"
                        style={{ animationDelay: `${index * 0.05}s` }}
                        actions={[
                          isLoggedIn ? (
                            <Button
                              key="like"
                              type="text"
                              size="small"
                              icon={isLiked ? <HeartFilled style={{ color: '#ff4d4f' }} /> : <HeartOutlined style={{ color: '#525252' }} />}
                              onClick={() => handleLikeComment(item._id)}
                              loading={isLiking}
                              className="flex items-center gap-1 hover:!text-red-500 transition-colors"
                            >
                              {likeCount > 0 && <span className="text-xs">{likeCount}</span>}
                            </Button>
                          ) : (
                            <Button
                              key="like"
                              type="text"
                              size="small"
                              icon={<HeartOutlined style={{ color: '#525252' }} />}
                              onClick={() => requireAuth()}
                              className="flex items-center gap-1 hover:!text-red-500 transition-colors"
                            >
                              {likeCount > 0 && <span className="text-xs">{likeCount}</span>}
                            </Button>
                          ),
                        ]}
                      >
                        <List.Item.Meta
                          avatar={
                            <a href={item.user?.htmlUrl} target="_blank" rel="noreferrer">
                              <Avatar size={40} src={item.user?.avatar} icon={<GithubOutlined />} />
                            </a>
                          }
                          title={
                            <div className="flex items-center gap-3">
                              <a
                                href={item.user?.htmlUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-gray-800 hover:text-blue-500 font-medium"
                              >
                                {item.user?.nickname || item.user?.username || '匿名'}
                              </a>
                              <Text className="text-gray-400 text-sm">
                                <ClockCircleOutlined className="mr-1" />
                                {dayjs(item.createdAt).format('YYYY-MM-DD HH:mm')}
                              </Text>
                            </div>
                          }
                          description={
                            <Paragraph className="!mb-0 mt-1 text-gray-600">
                              {item.content}
                            </Paragraph>
                          }
                        />
                      </List.Item>
                    );
                  }}
                />
                {commentTotal > commentPageSize && (
                  <div className="flex justify-center mt-4 pt-4 border-t border-gray-100">
                    <Pagination
                      current={commentPage}
                      total={commentTotal}
                      pageSize={commentPageSize}
                      showSizeChanger={false}
                      onChange={(p) => {
                        setCommentPage(p);
                      }}
                    />
                  </div>
                )}
              </>
            ) : (
              <Empty description="暂无评论，快来抢沙发吧！" />
            )}
          </Card>

          {/* Series navigation */}
          {article.series && (
            <SeriesNav
              seriesId={typeof article.series === 'object' ? (article.series as any)._id : article.series}
              seriesTitle={typeof article.series === 'object' ? (article.series as any).title : undefined}
              currentArticleId={article._id!}
            />
          )}

          {/* Related articles */}
          <RelatedArticles categoryId={article.category?._id} excludeId={article._id} tagIds={article.tags?.map((t: any) => t._id).filter(Boolean)} />
          </div>

        </div>
      </section>
      <Lightbox
        visible={lightbox.visible}
        images={lightbox.images}
        currentIndex={lightbox.currentIndex}
        onClose={lightbox.close}
        onIndexChange={lightbox.setCurrentIndex}
      />
    </div>
  );
};

export default ArticleDetailPage;
