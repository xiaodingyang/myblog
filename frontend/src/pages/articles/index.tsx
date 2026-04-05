import React, { useEffect, useState, useCallback, useMemo } from 'react';
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
import { request, useModel } from 'umi';
import { cachedRequest } from '@/utils/apiCache';
import { getColorThemeById } from '@/config/colorThemes';
import OptimizedImage from '@/components/OptimizedImage';
import ShareButton from '@/components/ShareButton';
import Empty from '@/components/Empty';
import ArticlesListSkeleton from '@/components/Skeleton/ArticlesListSkeleton';
import { fetchArticleDetail } from '@/utils/prefetch';
import useSEO from '@/hooks/useSEO';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

/* ─── helpers ─── */
const isNewArticle = (d: string) => dayjs().diff(dayjs(d), 'day') <= 7;
const isHotArticle = (v?: number) => (v || 0) >= 1000;
const artId = (a: API.Article) => a._id || (a as any).id;

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
              style={{ background: 'linear-gradient(135deg,#ff6b6b,#ee5a6f)', boxShadow: '0 2px 8px rgba(255,107,107,.4)' }}
            >
              <FireOutlined className="mr-1" />
              热门
            </span>
          )}
          {isNewArticle(article.createdAt) && (
            <span
              className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium text-white"
              style={{ background: 'linear-gradient(135deg,#10b981,#059669)', boxShadow: '0 2px 8px rgba(16,185,129,.4)' }}
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

  return (
    <Link
      to={id ? `/article/${id}` : '/articles'}
      className="block no-underline group"
      onMouseEnter={() => id && fetchArticleDetail(id)}
    >
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
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

        <div className="p-4">
          {/* date */}
          <div className="text-[11px] text-gray-400 mb-1.5 font-mono">
            {dayjs(article.createdAt).format('YYYY / MM / DD')}
          </div>

          {/* category + badges */}
          <div className="flex items-center flex-wrap gap-1.5 mb-2">
            <Tag className="!text-[11px] !rounded-md !border-gray-200 !bg-gray-50 !text-gray-500 !m-0 !px-1.5 !leading-5">
              <FolderOutlined className="mr-0.5" />
              {article.category?.name || '未分类'}
            </Tag>
            {isHot && (
              <Tag color="red" className="!text-[11px] !rounded-md !m-0 !px-1.5 !leading-5">
                <FireOutlined /> 热门
              </Tag>
            )}
            {isNew && (
              <Tag color="green" className="!text-[11px] !rounded-md !m-0 !px-1.5 !leading-5">
                新
              </Tag>
            )}
          </div>

          {/* title */}
          <h3 className="text-sm md:text-[15px] font-semibold text-gray-800 mb-1.5 line-clamp-2 leading-snug group-hover:text-[var(--theme-primary)] transition-colors">
            {article.title}
          </h3>

          {/* summary — 仅无封面的卡片展示更多摘要行 */}
          <p className={`text-xs text-gray-500 mb-2.5 leading-relaxed ${showCover && article.cover ? 'line-clamp-2' : 'line-clamp-3'}`}>
            {article.summary || '暂无摘要'}
          </p>

          {/* tags */}
          {article.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2.5">
              {article.tags.slice(0, 3).map((tag) => (
                <span key={tag._id} className="text-[11px] text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded">
                  #{tag.name}
                </span>
              ))}
              {article.tags.length > 3 && (
                <span className="text-[11px] text-gray-300">+{article.tags.length - 3}</span>
              )}
            </div>
          )}

          {/* footer */}
          <div className="flex items-center justify-between text-[11px] text-gray-400 pt-2 border-t border-gray-50">
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
    <div className="relative mt-10 md:mt-14">
      {/* ── 时间线标题 ── */}
      <div className="flex items-center gap-3 mb-8">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
          style={{ background: colorTheme.gradient }}
        >
          ✎
        </div>
        <div className="h-px flex-1 bg-gradient-to-r from-gray-200 to-transparent" />
        <span className="text-xs text-gray-400 flex-shrink-0">更多文章</span>
        <div className="h-px flex-1 bg-gradient-to-l from-gray-200 to-transparent" />
      </div>

      {/* ── 移动端：单列 + 左侧时间线 ── */}
      <div className="md:hidden relative pl-8">
        {/* timeline line */}
        <div
          className="absolute left-[11px] top-0 bottom-0 w-[2px] rounded-full"
          style={{ background: `linear-gradient(180deg, ${colorTheme.primary}, ${colorTheme.primary}33, transparent)` }}
        />
        <div className="space-y-5">
          {articles.map((article, i) => (
            <div key={artId(article) || i} className="relative animate-slide-up" style={{ animationDelay: `${i * 0.06}s` }}>
              {/* dot */}
              <div
                className="absolute -left-8 top-4 w-[10px] h-[10px] rounded-full ring-[3px] ring-white z-10"
                style={{ background: colorTheme.primary, left: 4 }}
              />
              <TimelineCard article={article} colorTheme={colorTheme} showCover={shouldShowCover(i)} />
            </div>
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
        <div className="w-1/2 space-y-6 relative z-10">
          {leftCol.map((article, i) => {
            const globalIdx = i * 2;
            return (
              <div
                key={artId(article) || globalIdx}
                className="relative animate-slide-up"
                style={{ animationDelay: `${globalIdx * 0.06}s` }}
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
            );
          })}
        </div>

        {/* right column — offset top for masonry stagger */}
        <div className="w-1/2 space-y-6 pt-20 relative z-10">
          {rightCol.map((article, i) => {
            const globalIdx = i * 2 + 1;
            return (
              <div
                key={artId(article) || globalIdx}
                className="relative animate-slide-up"
                style={{ animationDelay: `${globalIdx * 0.06}s` }}
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
  useSEO({
    title: '文章列表',
    description: '若风的技术博客文章列表，涵盖前端开发、后端技术、开源项目等内容。',
    keywords: '技术文章,前端开发,React,TypeScript,Node.js',
  });

  const { themeId: colorThemeId } = useModel('colorModel');
  const colorTheme = getColorThemeById(colorThemeId);

  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [articles, setArticles] = useState<API.Article[]>([]);
  const [total, setTotal] = useState(0);
  const [categories, setCategories] = useState<API.Category[]>([]);
  const [tags, setTags] = useState<API.Tag[]>([]);

  const page = Number(searchParams.get('page')) || 1;
  const pageSize = 9;
  const keyword = searchParams.get('keyword') || '';
  const categoryId = searchParams.get('category') || '';
  const tagId = searchParams.get('tag') || '';
  const sort = searchParams.get('sort') || 'latest';

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [articlesRes, categoriesRes, tagsRes] = await Promise.all([
          request<API.Response<API.PageResult<API.Article>>>('/api/articles', {
            params: { page, pageSize, keyword: keyword || undefined, category: categoryId || undefined, tag: tagId || undefined, sort },
          }),
          cachedRequest<API.Response<API.Category[]>>('/api/categories', {}, 30 * 60 * 1000),
          cachedRequest<API.Response<API.Tag[]>>('/api/tags', {}, 30 * 60 * 1000),
        ]);
        if (articlesRes.code === 0) {
          setArticles(articlesRes.data.list);
          setTotal(articlesRes.data.total);
        }
        if (categoriesRes.code === 0) setCategories(categoriesRes.data);
        if (tagsRes.code === 0) setTags(tagsRes.data);
      } catch {
        /* ignore */
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [page, keyword, categoryId, tagId, sort]);

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
      <div className="max-w-6xl mx-auto px-4 md:px-6">
        {/* ── 页面标题 ── */}
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

        {/* ── 内容容器 ── */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-4 md:p-8 shadow-lg relative z-10" style={{ minHeight: 400 }}>
          {/* ── 搜索筛选栏 ── */}
          <div className="flex flex-wrap items-center gap-3 mb-6 md:mb-8 p-3 md:p-4 rounded-xl bg-gray-50/80 border border-gray-100">
            <Input
              placeholder="搜索文章…"
              prefix={<SearchOutlined className="text-gray-400" />}
              value={keyword}
              onChange={(e) => updateParams('keyword', e.target.value)}
              onPressEnter={(e) => updateParams('keyword', (e.target as HTMLInputElement).value)}
              allowClear
              className="!rounded-lg !flex-1 !min-w-[160px]"
              style={{ maxWidth: 280 }}
            />
            <Select
              placeholder="分类"
              value={categoryId || undefined}
              onChange={(v) => updateParams('category', v || '')}
              allowClear
              className="!min-w-[120px]"
              suffixIcon={<FolderOutlined />}
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
              className="!min-w-[120px]"
              suffixIcon={<TagsOutlined />}
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
              className="!min-w-[110px]"
              suffixIcon={<SortAscendingOutlined />}
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
              <Text className="text-gray-400 text-xs">当前筛选：</Text>
              {keyword && (
                <Tag closable onClose={() => updateParams('keyword', '')} color="pink">
                  关键词：{keyword}
                </Tag>
              )}
              {categoryId && (
                <Tag closable onClose={() => updateParams('category', '')} color="green">
                  分类：{categories.find((c) => c._id === categoryId)?.name}
                </Tag>
              )}
              {tagId && (
                <Tag closable onClose={() => updateParams('tag', '')} color="pink">
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
              {heroArticle && <HeroArticle article={heroArticle} colorTheme={colorTheme} />}

              {/* 瀑布流 + 时间线 */}
              {restArticles.length > 0 && <MasonryTimeline articles={restArticles} colorTheme={colorTheme} />}

              {/* 分页 */}
              {total > pageSize && (
                <div className="flex justify-center mt-10 md:mt-14">
                  <Pagination
                    current={page}
                    total={total}
                    pageSize={pageSize}
                    showSizeChanger={false}
                    showTotal={(t) => <span className="text-gray-500 text-sm">共 {t} 篇文章</span>}
                    responsive
                    onChange={handlePageChange}
                  />
                </div>
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
