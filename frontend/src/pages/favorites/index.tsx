import React from 'react';
import { Link } from 'umi';
import { Tag, Avatar } from 'antd';
import { FolderOutlined, EyeOutlined, UserOutlined, FireOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { useModel } from 'umi';
import { getColorThemeById } from '@/config/colorThemes';
import OptimizedImage from '@/components/shared/OptimizedImage';
import ShareButton from '@/components/shared/ShareButton';
import { fetchArticleDetail } from '@/utils/prefetch';
import { themeBg, isNewArticle, isHotArticle, artId } from '@/utils/themeHelpers';
import { useTilt } from '@/hooks/useTilt';
import dayjs from 'dayjs';
import './index.less';

// 复用文章列表页的卡片组件
interface TimelineCardProps {
  article: API.Article;
  colorTheme: ReturnType<typeof getColorThemeById>;
}

const TimelineCard: React.FC<TimelineCardProps> = ({ article, colorTheme }) => {
  const id = artId(article);
  const isNew = isNewArticle(article.createdAt);
  const isHot = isHotArticle(article.views);
  const { ref: tiltRef, handlers: tiltHandlers, style: tiltStyle } = useTilt();

  return (
    <Link
      to={id ? `/article/${id}` : '/articles'}
      className="block no-underline group"
      onMouseEnter={() => id && fetchArticleDetail(id)}
    >
      <div
        ref={tiltRef}
        {...tiltHandlers}
        className="rounded-card-lg overflow-hidden"
        style={{
          ...tiltStyle,
          background: themeBg(colorTheme.primary, 0.15),
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: `1px solid ${themeBg(colorTheme.primary, 0.2)}`,
          boxShadow: `0 4px 16px rgba(0, 0, 0, 0.2)`,
        }}>
        {article.cover && (
          <div className="h-36 sm:h-44 overflow-hidden">
            <OptimizedImage
              src={article.cover}
              alt={article.title}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
        )}

        <div className="p-4 md:p-5">
          <div className="text-[11px] text-white/65 mb-2 font-mono">
            {dayjs(article.createdAt).format('YYYY / MM / DD')}
          </div>

          <div className="flex items-center flex-wrap gap-1.5 mb-2.5">
            <Tag className="!text-[11px] !rounded-md !m-0 !px-1.5 !leading-5 !border-white/15" style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.8)' }}>
              <FolderOutlined className="mr-0.5" />
              {article.category?.name || '未分类'}
            </Tag>
            {isHot && (
              <Tag color="red" className="!text-[11px] !rounded-md !m-0 !px-1.5 !leading-5" style={{ background: themeBg(colorTheme.primary, 0.25), color: colorTheme.primary, border: 'none' }}>
                <FireOutlined /> 热门
              </Tag>
            )}
            {isNew && (
              <Tag color="green" className="!text-[11px] !rounded-md !m-0 !px-1.5 !leading-5" style={{ background: themeBg(colorTheme.primary, 0.15), color: colorTheme.primary, border: 'none' }}>
                新
              </Tag>
            )}
          </div>

          <h3 className="text-sm md:text-[15px] font-semibold text-white/90 mb-2 line-clamp-2 leading-snug group-hover:text-[var(--theme-primary)] transition-colors" style={{ textShadow: '0 1px 6px rgba(0,0,0,0.3)' }}>
            {article.title}
          </h3>

          <p className={`text-xs text-white/65 mb-3 leading-relaxed ${article.cover ? 'line-clamp-2' : 'line-clamp-3'}`}>
            {article.summary || '暂无摘要'}
          </p>

          {article.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {article.tags.slice(0, 3).map((tag) => (
                <span key={tag._id} className="text-[11px] text-white/65 bg-white/10 px-1.5 py-0.5 rounded">
                  #{tag.name}
                </span>
              ))}
              {article.tags.length > 3 && (
                <span className="text-[11px] text-white/60">+{article.tags.length - 3}</span>
              )}
            </div>
          )}

          <div className="flex items-center justify-between text-[11px] text-white/60 pt-3 border-t border-white/10">
            <span className="flex items-center gap-1">
              <Avatar size={16} src={article.author?.avatar} icon={<UserOutlined />} style={{ background: colorTheme.primary }} />
              {article.author?.username || '匿名'}
            </span>
            <span className="flex items-center gap-2.5">
              <span>
                <EyeOutlined className="mr-0.5" />
                {article.views || 0}
              </span>
              <ShareButton
                title={article.title}
                summary={article.summary || ''}
                url={id ? `https://www.xiaodingyang.art/article/${id}` : undefined}
                cover={article.cover}
                mode="icon"
              />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

const FavoritesPage: React.FC = () => {
  const { themeId: colorThemeId } = useModel('colorModel');
  const currentColorTheme = getColorThemeById(colorThemeId);

  // 示例数据 - 使用 API.Article 格式
  const favoriteArticles: API.Article[] = [
    {
      _id: '1',
      title: 'GitHub OAuth 登录与评论系统实战总结',
      summary: '一、需求背景：博客需要个人博客希望实现访问者登录功能，具体需求：1. 访问进入博客后弹出登录提示，可选择使用 GitHub 账号授权登录 2. 登录后可以：评论文章、在留言留言...',
      cover: 'https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=800&h=600&fit=crop',
      category: { _id: 'cat1', name: '技术随笔与成长' },
      tags: [{ _id: 'tag1', name: 'Node.js' }, { _id: 'tag2', name: 'MongoDB' }],
      author: {
        _id: 'author1',
        username: 'ruofeng',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ruofeng',
      },
      views: 74,
      createdAt: '2026-03-19',
    },
    {
      _id: '2',
      title: 'React 18 并发特性深度解析',
      summary: '深入探讨 React 18 的并发渲染机制，包括 Suspense、Transitions 和自动批处理的实现原理...',
      cover: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=600&fit=crop',
      category: { _id: 'cat2', name: '前端框架' },
      tags: [{ _id: 'tag3', name: 'React' }, { _id: 'tag4', name: 'TypeScript' }],
      author: {
        _id: 'author1',
        username: 'ruofeng',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ruofeng',
      },
      views: 512,
      createdAt: '2026-04-02',
    },
    {
      _id: '3',
      title: 'Tailwind CSS 最佳实践',
      summary: '从零到一搭建基于 Tailwind CSS 的设计系统，包括主题配置、组件封装和性能优化...',
      cover: 'https://images.unsplash.com/photo-1507721999472-8ed4421c4af2?w=800&h=600&fit=crop',
      category: { _id: 'cat3', name: 'CSS 与设计' },
      tags: [{ _id: 'tag5', name: 'Tailwind' }, { _id: 'tag6', name: 'CSS' }],
      author: {
        _id: 'author1',
        username: 'ruofeng',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ruofeng',
      },
      views: 387,
      createdAt: '2026-04-15',
    },
  ];

  return (
    <div className="favorites-page">
      {/* 头部 */}
      <div className="favorites-header">
        <div className="favorites-header__icon">❤️</div>
        <h1 className="favorites-header__title">我的收藏</h1>
        <p className="favorites-header__subtitle">共收藏了 {favoriteArticles.length} 篇文章</p>
      </div>

      {/* 卡片网格 */}
      <div className="favorites-grid">
        {favoriteArticles.map((article) => (
          <TimelineCard key={article._id} article={article} colorTheme={currentColorTheme} />
        ))}
      </div>
    </div>
  );
};

export default FavoritesPage;
