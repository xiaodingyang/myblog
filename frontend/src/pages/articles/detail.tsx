import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useParams, Link, history } from 'umi';
import { Typography, Tag, Space, Avatar, Divider, Card, Button, Input, List, Pagination, message } from 'antd';
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
} from '@ant-design/icons';
import { request } from 'umi';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import dayjs from 'dayjs';
import Loading from '@/components/Loading';
import Empty from '@/components/Empty';
import ShareButton from '@/components/ShareButton';
import CopyPageUrlButton from '@/components/CopyPageUrlButton';
import useSEO from '@/hooks/useSEO';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const ArticleDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [article, setArticle] = useState<API.Article | null>(null);
  const { themeId: colorThemeId } = useModel('colorModel');
  const currentColorTheme = getColorThemeById(colorThemeId);
  const [submitting, setSubmitting] = useState(false);
  const [commentContent, setCommentContent] = useState('');
  const [comments, setComments] = useState<any[]>([]);
  const [commentTotal, setCommentTotal] = useState(0);
  const [commentPage, setCommentPage] = useState(1);
  const [commentLoading, setCommentLoading] = useState(false);
  const { githubUser, githubToken, isLoggedIn, requireAuth } = useModel('githubUserModel');
  const [likingComments, setLikingComments] = useState<Set<string>>(new Set());
  const [articleLikeLoading, setArticleLikeLoading] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const commentPageSize = 10;

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

  useSEO({
    title: article?.title,
    description: article?.summary || `阅读若风的技术博客文章：${article?.title || ''}`,
    keywords: article?.tags?.map((t: any) => t.name).join(',') || '技术文章',
    ogImage: article?.cover,
    ogType: 'article',
    ogUrl: typeof window !== 'undefined' ? window.location.href : undefined,
    jsonLd,
  });

  const fetchComments = useCallback(async (page: number) => {
    if (!id) return;
    setCommentLoading(true);
    try {
      const res = await request(`/api/comments/article/${id}`, {
        params: { page, pageSize: commentPageSize },
      });
      if (res.code === 0) {
        setComments(res.data.list);
        setCommentTotal(res.data.total);
      }
    } catch {
      // ignore
    } finally {
      setCommentLoading(false);
    }
  }, [id]);

  useEffect(() => {
    const fetchArticle = async () => {
      setLoading(true);
      try {
        const res = await request<API.Response<API.Article>>(`/api/articles/${id}`);
        if (res.code === 0) {
          setArticle(res.data);
        } else {
          message.error(res.message || '文章不存在');
        }
      } catch (error) {
        message.error('获取文章失败');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchArticle();
      fetchComments(1);
    }
  }, [id, fetchComments]);

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
          fetchComments(1);
          setCommentPage(1);
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

      // 乐观更新：先在本地更新状态
      const prevComments = [...comments];
      setComments(prev =>
        prev.map(c => {
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
        })
      );

      try {
        const res = await request(`/api/comments/${commentId}/like`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${githubToken}` },
        });
        if (res.code === 0) {
          // 更新本地状态，使用服务器返回的值
          setComments(prev =>
            prev.map(c => {
              if (c._id === commentId) {
                return { ...c, likeCount: res.data.likeCount, liked: res.data.liked };
              }
              return c;
            })
          );
        } else {
          // 失败则恢复原状态
          setComments(prevComments);
          message.error(res.message || '点赞失败');
        }
      } catch {
        setComments(prevComments);
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
          setArticle((prev) =>
            prev
              ? {
                  ...prev,
                  liked: res.data.liked,
                  likeCount: res.data.likeCount,
                }
              : null
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
            setArticle((prev) => (prev ? { ...prev, favorited: false } : null));
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
            setArticle((prev) => (prev ? { ...prev, favorited: true } : null));
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
    return <Loading />;
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
          <Title level={1} className="!text-white !mb-6" style={{ fontSize: 'clamp(1.5rem, 4vw, 2.5rem)' }}>
            {article.title}
          </Title>

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
              <span>{article.views || 0} 阅读</span>
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
      <section className="py-8 md:py-12">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <Card
            style={{
              borderRadius: 16,
              border: 'none',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
            }}
          >
            <div className="markdown-body">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw]}
                components={{
                  img: ({ src, alt, ...props }) => (
                    <img
                      src={src}
                      alt={alt || ''}
                      loading="lazy"
                      decoding="async"
                      className="rounded-lg max-w-full h-auto"
                      {...props}
                    />
                  ),
                  code({ node, className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || '');
                    const isInline = !match && !className;
                    return !isInline ? (
                      <SyntaxHighlighter
                        style={vscDarkPlus}
                        language={match ? match[1] : 'text'}
                        PreTag="div"
                        customStyle={{
                          margin: '1em 0',
                          borderRadius: '8px',
                          fontSize: '12px',
                          overflowX: 'auto',
                        }}
                        showLineNumbers
                        wrapLines
                        wrapLongLines
                      >
                        {String(children).replace(/\n$/, '')}
                      </SyntaxHighlighter>
                    ) : (
                      <code
                        className="bg-gray-100 text-pink-600 px-1.5 py-0.5 rounded text-sm font-mono"
                        {...props}
                      >
                        {children}
                      </code>
                    );
                  },
                }}
              >
                {article.content}
              </ReactMarkdown>
            </div>

            <Divider />

            <div className="flex flex-wrap items-center gap-3 justify-between">
              <Space wrap size="middle">
                <Button
                  type={article.liked ? 'primary' : 'default'}
                  danger={!!article.liked}
                  icon={article.liked ? <HeartFilled /> : <HeartOutlined />}
                  loading={articleLikeLoading}
                  onClick={handleArticleLike}
                >
                  ❤️ 点赞文章{' '}
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
              <Space wrap>
                <CopyPageUrlButton />
                <ShareButton
                  title={article.title}
                  summary={article.summary || ''}
                  cover={article.cover}
                />
              </Space>
            </div>
            <div className="mt-4">
              <Text className="text-gray-500 text-sm">
                最后更新于 {dayjs(article.updatedAt).format('YYYY-MM-DD HH:mm')}
              </Text>
            </div>
          </Card>

          {/* 评论区 */}
          <Card
            className="mt-8"
            style={{
              borderRadius: 16,
              border: 'none',
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
                    <TextArea
                      value={commentContent}
                      onChange={(e) => setCommentContent(e.target.value)}
                      placeholder="写下你的评论..."
                      rows={3}
                      showCount
                      maxLength={500}
                    />
                    <div className="flex items-center justify-between mt-8">
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
                  <GithubOutlined style={{ fontSize: 24, color: '#999', marginBottom: 8 }} />
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
              <Loading />
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
                              icon={isLiked ? <HeartFilled style={{ color: '#ff4d4f' }} /> : <HeartOutlined style={{ color: '#999' }} />}
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
                              icon={<HeartOutlined style={{ color: '#999' }} />}
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
                        fetchComments(p);
                      }}
                    />
                  </div>
                )}
              </>
            ) : (
              <Empty description="暂无评论，快来抢沙发吧！" />
            )}
          </Card>

        </div>
      </section>
    </div>
  );
};

export default ArticleDetailPage;
