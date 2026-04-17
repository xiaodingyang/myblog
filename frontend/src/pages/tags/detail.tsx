import React, { useState } from 'react';
import { useParams, history, Link } from 'umi';
import { useModel } from 'umi';
import { getColorThemeById } from '@/config/colorThemes';
import { Typography, Pagination, Tag, Avatar } from 'antd';
import {
  ArrowLeftOutlined,
  TagOutlined,
  EyeOutlined,
  ClockCircleOutlined,
  UserOutlined,
  FireOutlined,
} from '@ant-design/icons';
import OptimizedImage from '@/components/shared/OptimizedImage';
import ShareButton from '@/components/shared/ShareButton';
import Loading from '@/components/layout/Loading';
import Empty from '@/components/shared/Empty';
import { fetchArticleDetail } from '@/utils/prefetch';
import useSEO from '@/hooks/useSEO';
import { useTag, useArticles } from '@/hooks/useQueries';
import dayjs from 'dayjs';
import { themeBg, isNewArticle, isHotArticle, artId } from '@/utils/themeHelpers';

const { Title, Text, Paragraph } = Typography;

/* ================================================================
   ArticleRow — 文章横排卡片
   ================================================================ */
const ArticleRow: React.FC<{
  article: API.Article;
  colorTheme: ReturnType<typeof getColorThemeById>;
  index: number;
}> = ({ article, colorTheme, index }) => {
  const id = artId(article);
  const isNew = isNewArticle(article.createdAt);
  const isHot = isHotArticle(article.views);

  return (
    <Link
      to={id ? `/article/${id}` : '/articles'}
      className="block no-underline group"
      onMouseEnter={() => id && fetchArticleDetail(id)}
    >
      <div
        className="flex gap-5 md:gap-6 rounded-xl p-4 md:p-5 transition-all duration-300 hover:-translate-y-0.5 animate-slide-up"
        style={{
          background: themeBg(colorTheme.primary, 0.15),
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: `1px solid ${themeBg(colorTheme.primary, 0.2)}`,
          boxShadow: `0 4px 16px rgba(0, 0, 0, 0.2)`,
          animationDelay: `${index * 0.06}s`,
        }}
        onMouseEnter={(e) => {
          const el = e.currentTarget as HTMLElement;
          el.style.boxShadow = `0 8px 32px rgba(0,0,0,0.3), 0 0 20px ${themeBg(colorTheme.primary, 0.15)}`;
          el.style.borderColor = themeBg(colorTheme.primary, 0.4);
          el.style.transform = 'translateY(-3px)';
        }}
        onMouseLeave={(e) => {
          const el = e.currentTarget as HTMLElement;
          el.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.2)';
          el.style.borderColor = themeBg(colorTheme.primary, 0.2);
          el.style.transform = 'translateY(0)';
        }}
      >
        {article.cover && (
          <div className="w-24 h-24 md:w-32 md:h-32 rounded-lg overflow-hidden flex-shrink-0">
            <OptimizedImage
              src={article.cover}
              alt={article.title}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
        )}

        <div className="flex-1 min-w-0 flex flex-col justify-between">
          <div className="flex items-center flex-wrap gap-2 mb-2">
            <Tag className="!text-[11px] !rounded-md !m-0 !px-1.5 !leading-5 !border-white/20"
                  style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)' }}>
              <ClockCircleOutlined className="mr-0.5" />
              {dayjs(article.createdAt).format('YYYY-MM-DD')}
            </Tag>
            {isHot && (
              <Tag className="!text-[11px] !rounded-md !m-0 !px-1.5 !leading-5 !border-none"
                    style={{ background: themeBg(colorTheme.primary, 0.25), color: colorTheme.primary }}>
                <FireOutlined /> 热门
              </Tag>
            )}
            {isNew && (
              <Tag className="!text-[11px] !rounded-md !m-0 !px-1.5 !leading-5 !border-none"
                    style={{ background: themeBg(colorTheme.primary, 0.15), color: colorTheme.primary }}>
                新
              </Tag>
            )}
          </div>

          <h3 className="text-sm md:text-base font-semibold text-white/90 mb-1.5 line-clamp-1 group-hover:text-[var(--theme-primary)] transition-colors leading-snug" style={{ textShadow: '0 1px 6px rgba(0,0,0,0.3)' }}>
            {article.title}
          </h3>

          <p className="text-xs text-white/65 mb-3 line-clamp-2 leading-relaxed" style={{ textShadow: '0 1px 4px rgba(0,0,0,0.2)' }}>
            {article.summary || '暂无摘要'}
          </p>

          <div className="flex items-center justify-between text-[11px] text-white/60 pt-3 mt-1 border-t border-white/10">
            <span className="flex items-center gap-1.5">
              <Avatar size={16} src={article.author?.avatar} icon={<UserOutlined />} style={{ background: colorTheme.primary }} />
              {article.author?.username || '匿名'}
              <span className="ml-2">
                <EyeOutlined className="mr-0.5" />
                {article.views || 0}
              </span>
            </span>
            <ShareButton
              title={article.title}
              summary={article.summary || ''}
              url={id ? `https://www.xiaodingyang.art/article/${id}` : undefined}
              cover={article.cover}
              mode="icon"
            />
          </div>
        </div>
      </div>
    </Link>
  );
};

/* ================================================================
   TagDetailPage — 主页面
   ================================================================ */
const TagDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { themeId: colorThemeId } = useModel('colorModel');
  const colorTheme = getColorThemeById(colorThemeId);
  const [page, setPage] = useState(1);
  const pageSize = 9;

  const { data: tag, isLoading: tagLoading } = useTag(id!);
  const { data: articlesData, isLoading: articlesLoading } = useArticles({
    page,
    pageSize,
    tag: id,
  });

  const loading = tagLoading || articlesLoading;
  const articles = articlesData?.list ?? [];
  const total = articlesData?.total ?? 0;

  const seo = useSEO({
    title: tag ? `${tag.name} - 标签` : '标签详情',
    description: tag ? `浏览标签「${tag.name}」下的所有技术文章。` : '标签详情',
    keywords: tag ? `${tag.name},文章标签,技术博客` : '文章标签',
  });

  if (loading) {
    return <>{seo}<Loading /></>;
  }

  if (!tag) {
    return (
      <div className="py-16">
        {seo}
        <Empty
          description="标签不存在"
          showAction
          actionText="返回分类页"
          actionLink="/categories#article-tags"
        />
      </div>
    );
  }

  return (
    <div className="animate-fade-in py-6 md:py-8">
      {seo}
      <div className="max-w-6xl mx-auto px-4 md:px-6">
        {/* ── 沉浸式 Hero 头部 ── */}
        <div className="text-center mb-10 md:mb-14 relative">
          <button
            onClick={() => history.back()}
            className="absolute left-0 top-0 group inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs text-white transition-all duration-300 hover:scale-105"
            style={{
              background: colorTheme.gradient,
              boxShadow: `0 4px 12px ${colorTheme.primary}55`,
            }}
          >
            <ArrowLeftOutlined className="transition-transform duration-300 group-hover:-translate-x-0.5" />
            返回
          </button>

          {/* 面包屑 */}
          <div className="flex items-center justify-center gap-2 text-white/60 text-xs mb-4">
            <Link to="/" className="text-white/60 hover:text-white/90 transition-colors">首页</Link>
            <span>/</span>
            <Link to="/categories#article-tags" className="text-white/60 hover:text-white/90 transition-colors">标签</Link>
            <span>/</span>
            <span className="text-white/80">#{tag.name}</span>
          </div>

          {/* 标签图标 */}
          <div
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
            style={{ background: colorTheme.gradient, boxShadow: `0 8px 24px ${colorTheme.primary}44` }}
          >
            <TagOutlined className="text-3xl text-white" />
          </div>

          {/* 标签名 */}
          <Title
            level={1}
            className="!mb-3 md:!mb-4 !text-white !text-2xl md:!text-4xl"
            style={{ textShadow: '0 2px 24px rgba(0, 0, 0, 0.45)' }}
          >
            #{tag.name}
          </Title>

          {/* 统计标签 */}
          <div className="flex items-center justify-center gap-3">
            <span
              className="inline-flex items-center px-3 py-1 rounded-full text-[12px] text-white/90"
              style={{ background: 'rgba(255, 255, 255, 0.15)', border: '1px solid rgba(255, 255, 255, 0.25)' }}
            >
              共 {total} 篇文章
            </span>
          </div>
        </div>

        {/* ── 内容容器（深色毛玻璃） ── */}
        <div
          className="rounded-2xl p-4 md:p-8 relative z-10"
          style={{
            minHeight: 300,
            background: themeBg(colorTheme.primary, 0.12),
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: `1px solid ${themeBg(colorTheme.primary, 0.18)}`,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
          }}
        >
          {articles.length > 0 ? (
            <>
              {/* 分隔标题 */}
              <div className="flex items-center gap-3 mb-8">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0"
                  style={{ background: colorTheme.gradient }}
                >
                  ✎
                </div>
                <div className="h-px flex-1 bg-gradient-to-r from-white/15 to-transparent" />
                <span className="text-xs text-white/65 flex-shrink-0">全部文章</span>
                <div className="h-px flex-1 bg-gradient-to-l from-white/15 to-transparent" />
              </div>

              {/* 文章列表 */}
              <div className="space-y-5">
                {articles.map((article, index) => (
                  <ArticleRow
                    key={artId(article) || index}
                    article={article}
                    colorTheme={colorTheme}
                    index={index}
                  />
                ))}
              </div>

              {/* 分页 */}
              {total > pageSize && (
                <div className="flex justify-center mt-10 md:mt-12 [&_.ant-pagination-item]:!bg-white/10 [&_.ant-pagination-item]:!border-white/15 [&_.ant-pagination-item]:!text-white/70 [&_.ant-pagination-item-active]:!border-[var(--theme-primary)] [&_.ant-pagination-item-active>a]:!text-[var(--theme-primary)] [&_.ant-pagination-prev]:!text-white/60 [&_.ant-pagination-next]:!text-white/60">
                  <Pagination
                    current={page}
                    total={total}
                    pageSize={pageSize}
                    showSizeChanger={false}
                    showTotal={(t) => <span className="text-white/65 text-sm">共 {t} 篇文章</span>}
                    responsive
                    onChange={(p) => {
                      setPage(p);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                  />
                </div>
              )}
            </>
          ) : (
            <Empty description="该标签下暂无文章" />
          )}
        </div>
      </div>
    </div>
  );
};

export default TagDetailPage;
