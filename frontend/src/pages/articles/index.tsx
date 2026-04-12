import React, { useCallback, useMemo } from 'react';
import { useSearchParams, Link } from 'umi';
import { Typography, Input, Select, Space, Pagination, Tag, Avatar } from 'antd';
import {
  SearchOutlined,
  FolderOutlined,
  TagsOutlined,
  SortAscendingOutlined,
  EyeOutlined,
  ClockCircleOutlined,
  UserOutlined,
  FireOutlined,
  FilterOutlined,
} from '@ant-design/icons';
import { useModel } from 'umi';
import { getColorThemeById } from '@/config/colorThemes';
import OptimizedImage from '@/components/shared/OptimizedImage';
import ShareButton from '@/components/shared/ShareButton';
import Empty from '@/components/shared/Empty';
import ArticlesListSkeleton from '@/components/layout/Skeleton/ArticlesListSkeleton';
import { fetchArticleDetail } from '@/utils/prefetch';
import useSEO from '@/hooks/useSEO';
import { useArticles, useCategories, useTags } from '@/hooks/useQueries';
import dayjs from 'dayjs';
import { themeBg, isNewArticle, isHotArticle, artId } from '@/utils/themeHelpers';
import ScrollReveal from '@/components/visual/ScrollReveal';
import { useTilt } from '@/hooks/useTilt';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

/* ================================================================
   Hero — 杂志风精选大图
   ================================================================ */
const HeroArticle: React.FC<{ article: API.Article; colorTheme: ReturnType<typeof getColorThemeById> }> = ({
  article,
  colorTheme,
}) => {
  const id = artId(article);
  return (
    <Link
      to={id ? `/article/${id}` : '/articles'}
      className="block no-underline group mb-10 md:mb-14"
      onMouseEnter={() => id && fetchArticleDetail(id)}
    >
      <div className="relative h-[260px] sm:h-[340px] md:h-[420px] rounded-2xl overflow-hidden shadow-lg">
        {article.cover ? (
          <OptimizedImage
            src={article.cover}
            alt={article.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full" style={{ background: colorTheme.gradient }} />
        )}

        {/* gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/5" />

        {/* top‑left label */}
        <div className="absolute top-4 md:top-6 left-4 md:left-6">
          <span
            className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold text-white/90 backdrop-blur-md"
            style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)' }}
          >
            ✦ 精选推荐
          </span>
        </div>

        {/* badges */}
        <div className="absolute top-4 md:top-6 right-4 md:right-6 flex gap-2">
          {isHotArticle(article.views) && (
            <span
              className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium text-white"
              style={{ background: colorTheme.gradient, boxShadow: `0 2px 8px ${themeBg(colorTheme.primary, 0.4)}` }}
            >
              <FireOutlined className="mr-1" />
              热门
            </span>
          )}
          {isNewArticle(article.createdAt) && (
            <span
              className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium text-white"
              style={{ background: `linear-gradient(135deg,${colorTheme.primary}88,${colorTheme.primary})`, boxShadow: `0 2px 8px ${themeBg(colorTheme.primary, 0.35)}` }}
            >
              新
            </span>
          )}
        </div>

        {/* text content */}
        <div className="absolute bottom-0 left-0 right-0 p-5 md:p-10">
          <Tag
            className="!border-none !text-white/90 !px-3 !py-0.5 !rounded-full !text-xs !mb-3"
            style={{
              background: 'rgba(255,255,255,0.18)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.3)',
            }}
          >
            <FolderOutlined className="mr-1" />
            {article.category?.name || '未分类'}
          </Tag>

          <h2
            className="text-white text-lg sm:text-2xl md:text-3xl font-bold mb-2 md:mb-3 leading-tight line-clamp-2"
            style={{ textShadow: '0 2px 12px rgba(0,0,0,.5)' }}
          >
            {article.title}
          </h2>

          <p
            className="text-white/75 text-xs sm:text-sm md:text-base mb-4 line-clamp-2 max-w-2xl"
            style={{ textShadow: '0 1px 6px rgba(0,0,0,.4)' }}
          >
            {article.summary || '暂无摘要'}
          </p>

          <div className="flex items-center flex-wrap gap-3 text-white/65 text-xs md:text-sm">
            <span className="flex items-center gap-1.5">
              <Avatar size={22} src={article.author?.avatar} icon={<UserOutlined />} style={{ background: colorTheme.primary }} />
              {article.author?.username || '匿名'}
            </span>
            <span>
              <ClockCircleOutlined className="mr-1" />
              {dayjs(article.createdAt).format('YYYY-MM-DD')}
            </span>
            <span>
              <EyeOutlined className="mr-1" />
              {article.views || 0}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

/* ================================================================
   TimelineCard — 瀑布流中的单张卡片
   ================================================================ */
interface TimelineCardProps {
  article: API.Article;
  colorTheme: ReturnType<typeof getColorThemeById>;
  showCover: boolean; // 交替展示封面，制造高度差
}

const TimelineCard: React.FC<TimelineCardProps> = ({ article, colorTheme, showCover }) => {
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
        className="rounded-xl overflow-hidden"
        style={{
          ...tiltStyle,
          background: themeBg(colorTheme.primary, 0.15),
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: `1px solid ${themeBg(colorTheme.primary, 0.2)}`,
          boxShadow: `0 4px 16px rgba(0, 0, 0, 0.2)`,
        }}>
        {/* cover — 部分卡片显示，部分不显示，制造瀑布流高度差 */}
        {showCover && article.cover && (
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
          {/* date */}
          <div className="text-[11px] text-white/65 mb-2 font-mono">
            {dayjs(article.createdAt).format('YYYY / MM / DD')}
          </div>

          {/* category + badges */}
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

          {/* title */}
          <h3 className="text-sm md:text-[15px] font-semibold text-white/90 mb-2 line-clamp-2 leading-snug group-hover:text-[var(--theme-primary)] transition-colors" style={{ textShadow: '0 1px 6px rgba(0,0,0,0.3)' }}>
            {article.title}
          </h3>

          {/* summary — 仅无封面的卡片展示更多摘要行 */}
          <p className={`text-xs text-white/65 mb-3 leading-relaxed ${showCover && article.cover ? 'line-clamp-2' : 'line-clamp-3'}`}>
            {article.summary || '暂无摘要'}
          </p>

          {/* tags */}
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

          {/* footer */}
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

/* ================================================================
   MasonryTimeline — 双栏瀑布流 + 中间时间线
   ================================================================ */
const MasonryTimeline: React.FC<{ articles: API.Article[]; colorTheme: ReturnType<typeof getColorThemeById> }> = ({
  articles,
  colorTheme,
}) => {
  // 把文章分成左右两栏
  const leftCol: API.Article[] = [];
  const rightCol: API.Article[] = [];
  articles.forEach((a, i) => (i % 2 === 0 ? leftCol : rightCol).push(a));

  // 根据索引决定是否显示封面图（交替显示，制造高度差）
  const shouldShowCover = (globalIndex: number) => {
    // 模式: 显示 → 不显示 → 显示 → 显示 → 不显示 → ...  不规则感
    const pattern = [true, false, true, true, false, true, false, false, true];
    return pattern[globalIndex % pattern.length];
  };

  return (
    <div className="relative mt-12 md:mt-16">
      {/* ── 时间线标题 ── */}
      <div className="flex items-center gap-3 mb-10">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
          style={{ background: colorTheme.gradient }}
        >
          ✎
        </div>
        <div className="h-px flex-1 bg-gradient-to-r from-white/15 to-transparent" />
        <span className="text-xs text-white/65 flex-shrink-0">更多文章</span>
        <div className="h-px flex-1 bg-gradient-to-l from-white/15 to-transparent" />
      </div>

      {/* ── 移动端：单列 + 左侧时间线 ── */}
      <div className="md:hidden relative pl-8">
        {/* timeline line */}
        <div
          className="absolute left-[11px] top-0 bottom-0 w-[2px] rounded-full"
          style={{ background: `linear-gradient(180deg, ${colorTheme.primary}, ${colorTheme.primary}33, transparent)` }}
        />
        <div className="space-y-6">
          {articles.map((article, i) => (
            <ScrollReveal key={artId(article) || i} direction="up" delay={i * 0.06}>
              <div className="relative">
              {/* dot */}
              <div
                className="absolute -left-8 top-4 w-[10px] h-[10px] rounded-full ring-[3px] ring-white z-10"
                style={{ background: colorTheme.primary, left: 4 }}
              />
              <TimelineCard article={article} colorTheme={colorTheme} showCover={shouldShowCover(i)} />
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>

      {/* ── 桌面端：双栏瀑布流 + 中间时间线 ── */}
      <div className="hidden md:flex gap-10 relative">
        {/* center timeline */}
        <div
          className="absolute left-1/2 -translate-x-[1px] top-0 bottom-0 w-[2px] rounded-full z-0"
          style={{ background: `linear-gradient(180deg, ${colorTheme.primary}, ${colorTheme.primary}22, transparent)` }}
        />

        {/* left column */}
        <div className="w-1/2 space-y-7 relative z-10">
          {leftCol.map((article, i) => {
            const globalIdx = i * 2;
            return (
              <ScrollReveal key={artId(article) || globalIdx} direction="up" delay={globalIdx * 0.06}>
              <div
                className="relative"
              >
                {/* dot on the right edge → timeline center */}
                <div
                  className="absolute -right-[23px] top-5 w-[10px] h-[10px] rounded-full ring-[3px] ring-white z-20"
                  style={{ background: colorTheme.primary }}
                />
                {/* connector line */}
                <div
                  className="absolute -right-[18px] top-[23px] w-[14px] h-[2px]"
                  style={{ background: colorTheme.primary, opacity: 0.3 }}
                />
                <TimelineCard article={article} colorTheme={colorTheme} showCover={shouldShowCover(globalIdx)} />
              </div>
              </ScrollReveal>
            );
          })}
        </div>

        {/* right column — offset top for masonry stagger */}
        <div className="w-1/2 space-y-7 pt-20 relative z-10">
          {rightCol.map((article, i) => {
            const globalIdx = i * 2 + 1;
            return (
              <ScrollReveal key={artId(article) || globalIdx} direction="up" delay={globalIdx * 0.06}>
              <div
                className="relative"
              >
                {/* dot on the left edge → timeline center */}
                <div
                  className="absolute -left-[23px] top-5 w-[10px] h-[10px] rounded-full ring-[3px] ring-white z-20"
                  style={{ background: colorTheme.primary }}
                />
                {/* connector line */}
                <div
                  className="absolute -left-[18px] top-[23px] w-[14px] h-[2px]"
                  style={{ background: colorTheme.primary, opacity: 0.3 }}
                />
                <TimelineCard article={article} colorTheme={colorTheme} showCover={shouldShowCover(globalIdx)} />
              </div>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </div>
  );
};

/* ================================================================
   ArticlesPage — 主页面
   ================================================================ */
const ArticlesPage: React.FC = () => {
  const seo = useSEO({
    title: '文章列表',
    description: '若风的技术博客文章列表，涵盖前端开发、后端技术、开源项目等内容。',
    keywords: '技术文章,前端开发,React,TypeScript,Node.js',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: '文章列表 - 若风的博客',
      url: 'https://www.xiaodingyang.art/articles',
      description: '若风的技术博客文章列表',
    },
  });

  const { themeId: colorThemeId } = useModel('colorModel');
  const colorTheme = getColorThemeById(colorThemeId);

  const [searchParams, setSearchParams] = useSearchParams();

  const page = Number(searchParams.get('page')) || 1;
  const pageSize = 9;
  const keyword = searchParams.get('keyword') || '';
  const categoryId = searchParams.get('category') || '';
  const tagId = searchParams.get('tag') || '';
  const sort = searchParams.get('sort') || 'latest';

  const { data: articlesData, isLoading: articlesLoading } = useArticles({
    page, pageSize,
    keyword: keyword || undefined,
    category: categoryId || undefined,
    tag: tagId || undefined,
    sort,
  });
  const { data: categories = [], isLoading: categoriesLoading } = useCategories();
  const { data: tags = [], isLoading: tagsLoading } = useTags();
  const loading = articlesLoading || categoriesLoading || tagsLoading;
  const articles = articlesData?.list ?? [];
  const total = articlesData?.total ?? 0;

  const updateParams = useCallback(
    (key: string, value: string) => {
      const p = new URLSearchParams(searchParams);
      value ? p.set(key, value) : p.delete(key);
      p.set('page', '1');
      setSearchParams(p);
    },
    [searchParams, setSearchParams],
  );

  const clearFilters = useCallback(() => setSearchParams({}), [setSearchParams]);

  const handlePageChange = useCallback(
    (p: number) => {
      const np = new URLSearchParams(searchParams);
      np.set('page', String(p));
      setSearchParams(np);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [searchParams, setSearchParams],
  );

  const hasFilters = keyword || categoryId || tagId;
  const [heroArticle, ...restArticles] = articles;

  /* ── render ── */
  return (
    <div className="animate-fade-in py-6 md:py-8">
      {seo}
      <div className="max-w-6xl mx-auto px-4 md:px-6">
        {/* ── 页面标题 ── */}
        <ScrollReveal direction="up">
        <div className="text-center mb-8 md:mb-12">
          <Title
            level={1}
            className="!mb-2 md:!mb-3 !text-white !text-2xl md:!text-4xl"
            style={{ textShadow: '0 2px 24px rgba(0,0,0,.45)' }}
          >
            文章列表
          </Title>
          <Text className="!text-white/85 text-sm md:text-lg" style={{ textShadow: '0 1px 12px rgba(0,0,0,.35)' }}>
            共 {total} 篇文章，记录技术成长的点滴
          </Text>
        </div>
        </ScrollReveal>

        {/* ── 内容容器 ── */}
        <div className="rounded-2xl p-4 md:p-8 relative z-10" style={{
          minHeight: 400,
          background: themeBg(colorTheme.primary, 0.12),
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: `1px solid ${themeBg(colorTheme.primary, 0.18)}`,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
        }}>
          {/* ── 搜索筛选栏 ── */}
          <div className="flex flex-wrap items-center gap-3 mb-6 md:mb-8 p-4 md:p-5 rounded-xl" style={{
            background: 'rgba(255, 255, 255, 0.08)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}>
            <Input
              placeholder="搜索文章…"
              prefix={<SearchOutlined className="text-white/60" />}
              value={keyword}
              onChange={(e) => updateParams('keyword', e.target.value)}
              onPressEnter={(e) => updateParams('keyword', (e.target as HTMLInputElement).value)}
              allowClear
              className="!rounded-lg !flex-1 !min-w-[160px] [&_.ant-input]:!bg-white/10 [&_.ant-input]:!text-white/80 [&_.ant-input]:!border-white/20 [&_.ant-input]:placeholder:!text-white/45 [&_.ant-input-clear-icon]:!text-white/60 [&_.ant-input]:!backdrop-blur-[10px] [&_.ant-input]:!backdrop-saturate-[180%]"
              style={{ maxWidth: 280 }}
            />
            <Select
              placeholder="分类"
              value={categoryId || undefined}
              onChange={(v) => updateParams('category', v || '')}
              allowClear
              className="!min-w-[120px] [&_.ant-select-selector]:!bg-white/10 [&_.ant-select-selector]:!text-white/80 [&_.ant-select-selector]:!border-white/15 [&_.ant-select-selection-placeholder]:!text-white/50"
              suffixIcon={<FolderOutlined className="text-white/60" />}
              popupMatchSelectWidth={false}
            >
              {categories.map((c) => (
                <Option key={c._id} value={c._id}>
                  {c.name}
                </Option>
              ))}
            </Select>
            <Select
              placeholder="标签"
              value={tagId || undefined}
              onChange={(v) => updateParams('tag', v || '')}
              allowClear
              className="!min-w-[120px] [&_.ant-select-selector]:!bg-white/10 [&_.ant-select-selector]:!text-white/80 [&_.ant-select-selector]:!border-white/15 [&_.ant-select-selection-placeholder]:!text-white/50"
              suffixIcon={<TagsOutlined className="text-white/60" />}
              popupMatchSelectWidth={false}
            >
              {tags.map((t) => (
                <Option key={t._id} value={t._id}>
                  {t.name}
                </Option>
              ))}
            </Select>
            <Select
              value={sort}
              onChange={(v) => updateParams('sort', v)}
              className="!min-w-[110px] [&_.ant-select-selector]:!bg-white/10 [&_.ant-select-selector]:!text-white/80 [&_.ant-select-selector]:!border-white/15 [&_.ant-select-selection-placeholder]:!text-white/50"
              suffixIcon={<SortAscendingOutlined className="text-white/60" />}
              popupMatchSelectWidth={false}
            >
              <Option value="latest">最新优先</Option>
              <Option value="oldest">最旧优先</Option>
              <Option value="hottest">热门优先</Option>
            </Select>
            {hasFilters && (
              <a onClick={clearFilters} className="text-[var(--theme-primary)] cursor-pointer text-sm whitespace-nowrap">
                <FilterOutlined className="mr-1" />
                清除筛选
              </a>
            )}
          </div>

          {/* 当前筛选标签 */}
          {hasFilters && (
            <div className="flex flex-wrap items-center gap-2 mb-6">
              <Text className="text-white/60 text-xs">当前筛选：</Text>
              {keyword && (
                <Tag closable onClose={() => updateParams('keyword', '')} style={{ background: themeBg(colorTheme.primary, 0.2), color: colorTheme.primary, border: 'none' }}>
                  关键词：{keyword}
                </Tag>
              )}
              {categoryId && (
                <Tag closable onClose={() => updateParams('category', '')} style={{ background: themeBg(colorTheme.primary, 0.15), color: colorTheme.primary, border: 'none' }}>
                  分类：{categories.find((c) => c._id === categoryId)?.name}
                </Tag>
              )}
              {tagId && (
                <Tag closable onClose={() => updateParams('tag', '')} style={{ background: themeBg(colorTheme.primary, 0.2), color: colorTheme.primary, border: 'none' }}>
                  标签：{tags.find((t) => t._id === tagId)?.name}
                </Tag>
              )}
            </div>
          )}

          {/* ── 主内容 ── */}
          {loading ? (
            <ArticlesListSkeleton />
          ) : articles.length > 0 ? (
            <>
              {/* Hero — 杂志风首篇 */}
              {heroArticle && <ScrollReveal direction="up" delay={0.1}><HeroArticle article={heroArticle} colorTheme={colorTheme} /></ScrollReveal>}

              {/* 瀑布流 + 时间线 */}
              {restArticles.length > 0 && <MasonryTimeline articles={restArticles} colorTheme={colorTheme} />}

              {/* 分页 */}
              {total > pageSize && (
                <ScrollReveal direction="up">
                <div className="flex justify-center mt-10 md:mt-14">
                  <Pagination
                    current={page}
                    total={total}
                    pageSize={pageSize}
                    showSizeChanger={false}
                    showTotal={(t) => <span className="text-white/65 text-sm">共 {t} 篇文章</span>}
                    responsive
                    onChange={handlePageChange}
                  />
                </div>
                </ScrollReveal>
              )}
            </>
          ) : (
            <Empty description="暂无文章" showAction actionText="返回首页" actionLink="/" />
          )}
        </div>
      </div>
    </div>
  );
};

export default ArticlesPage;
