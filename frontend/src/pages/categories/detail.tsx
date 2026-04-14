import React, { useState } from 'react';
import { useParams, history, Link } from 'umi';
import { useModel } from 'umi';
import { getColorThemeById } from '@/config/colorThemes';
import { Typography, Pagination, Tag, Avatar } from 'antd';
import {
  ArrowLeftOutlined,
  FolderOutlined,
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
import { useCategory, useArticles } from '@/hooks/useQueries';
import dayjs from 'dayjs';
import { themeBg, isNewArticle, isHotArticle, artId } from '@/utils/themeHelpers';

const { Title, Text, Paragraph } = Typography;

/* ================================================================
   ArticleRow — 文章横排卡片（更紧凑，适配详情页布局）
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
        {/* 封面 */}
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

        {/* 内容 */}
        <div className="flex-1 min-w-0 flex flex-col justify-between">
          {/* 标签行 */}
          <div className="flex items-center flex-wrap gap-2 mb-2">
            <Tag className="!text-[11px] !rounded-md !m-0 !px-1.5 !leading-5 !border-white/20"
                  style={{ background: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.75)' }}>
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

          {/* 标题 */}
          <h3 className="text-sm md:text-base font-semibold text-white/90 mb-1.5 line-clamp-1 group-hover:text-[var(--theme-primary)] transition-colors leading-snug" style={{ textShadow: '0 1px 6px rgba(0,0,0,0.3)' }}>
            {article.title}
          </h3>

          {/* 摘要 */}
          <p className="text-xs text-white/65 mb-3 line-clamp-2 leading-relaxed" style={{ textShadow: '0 1px 4px rgba(0,0,0,0.2)' }}>
            {article.summary || '暂无摘要'}
          </p>

          {/* 底部 */}
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
   CategoryDetailPage — 主页面
   ================================================================ */
const CategoryDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { themeId: colorThemeId } = useModel('colorModel');
  const colorTheme = getColorThemeById(colorThemeId);
  const [page, setPage] = useState(1);
  const pageSize = 9;

  const { data: category, isLoading: categoryLoading } = useCategory(id!);
  const { data: articlesData, isLoading: articlesLoading } = useArticles({
    page,
    pageSize,
    category: id,
  });

  const loading = categoryLoading || articlesLoading;
  const articles = articlesData?.list ?? [];
  const total = articlesData?.total ?? 0;

  const seo = useSEO({
    title: category ? `${category.name} - 分类` : '分类详情',
    description: category ? `浏览分类「${category.name}」下的所有技术文章。` : '分类详情',
    keywords: category ? `${category.name},文章分类,技术博客` : '文章分类',
  });

  if (loading) {
    return <>{seo}<Loading /></>;
  }

  if (!category) {
    return (
      <div className="py-16">
        {seo}
        <Empty
          description="分类不存在"
          showAction
          actionText="返回分类列表"
          actionLink="/categories"
        />
      </div>
    );
  }

  return (
    <div className="animate-fade-in py-6 md:py-8">
      {seo}
      <div className="max-w-6xl mx-auto px-4 md:px-6">
        {/* ── 沉浸式 Hero 头部（白色文字 + 粒子背景） ── */}
        <div className="text-center mb-10 md:mb-14 relative">
          {/* 返回按钮 */}
          <button
            onClick={() => history.back()}
            className="absolute left-0 top-0 group inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs text-white transition-all duration-300 hover:scale-105"
            style={{
              background: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              boxShadow: `0 2px 8px rgba(0, 0, 0, 0.1)`,
            }}
          >
            <ArrowLeftOutlined className="transition-transform duration-300 group-hover:-translate-x-0.5" />
            返回
          </button>

          {/* 面包屑 */}
          <div className="flex items-center justify-center gap-2 text-white/60 text-xs mb-4">
            <Link to="/" className="text-white/60 hover:text-white/90 transition-colors">首页</Link>
            <span>/</span>
            <Link to="/categories" className="text-white/60 hover:text-white/90 transition-colors">分类</Link>
            <span>/</span>
            <span className="text-white/80">{category.name}</span>
          </div>

          {/* 分类图标 */}
          <div
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
            style={{ background: colorTheme.gradient, boxShadow: `0 8px 24px ${colorTheme.primary}44` }}
          >
            <FolderOutlined className="text-3xl text-white" />
          </div>

          {/* 分类名 */}
          <Title
            level={1}
            className="!mb-3 md:!mb-4 !text-white !text-2xl md:!text-4xl"
            style={{ textShadow: '0 2px 24px rgba(0, 0, 0, 0.45)' }}
          >
            {category.name}
          </Title>

          {/* 描述 */}
          <Text
            className="!text-white/80 text-sm md:text-base block mb-4"
            style={{ textShadow: '0 1px 12px rgba(0, 0, 0, 0.35)' }}
          >
            {category.description || '暂无描述'}
          </Text>

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

        {/* ── 内容容器（半透明玻璃态） ── */}
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
                <div className="flex justify-center mt-10 md:mt-12 [&_.ant-pagination-item]:!bg-white/15 [&_.ant-pagination-item]:!border-white/25 [&_.ant-pagination-item]:!text-white/70 [&_.ant-pagination-item-active]:!border-[var(--theme-primary)] [&_.ant-pagination-item-active>a]:!text-[var(--theme-primary)] [&_.ant-pagination-prev]:!text-white/60 [&_.ant-pagination-next]:!text-white/60 [&_.ant-pagination-jump-prev]:!text-white/60 [&_.ant-pagination-jump-next]:!text-white/60">
                  <Pagination
                    current={page}
                    total={total}
                    pageSize={pageSize}
                    showSizeChanger={false}
                    showTotal={(t) => <span className="text-white/60 text-sm">共 {t} 篇文章</span>}
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
            <Empty description="该分类下暂无文章" />
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoryDetailPage;
