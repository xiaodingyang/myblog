import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { Link } from 'umi';
import { Typography, Tag, Space, Button } from 'antd';
import { useModel } from 'umi';
import { getColorThemeById } from '@/config/colorThemes';
import HomeSkeleton from '@/components/layout/Skeleton/HomeSkeleton';
import {
  ArrowRightOutlined,
  ArrowDownOutlined,
  FireOutlined,
  ClockCircleOutlined,
  FolderOutlined,
  TagsOutlined,
  EyeOutlined,
  RocketOutlined,
  CodeOutlined,
  BookOutlined,
} from '@ant-design/icons';
import DailyQuote from '@/components/shared/DailyQuote';
import OptimizedImage from '@/components/shared/OptimizedImage';
import { getReadArticleIds, sortByPopularity } from '@/utils/recommend';
import useSEO from '@/hooks/useSEO';
import { useArticles, useCategories, useTags } from '@/hooks/useQueries';
import MotionButton from '@/components/visual/MotionButton';
import { motion } from 'framer-motion';

/* 首屏内容元素列表 - 用于 stagger 动画 */
const sectionVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] } },
};

// 轻量日期格式化
const formatDate = (date: string) => {
  const d = new Date(date);
  return `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const { Title, Paragraph, Text } = Typography;

// request 从 umi 的 useRequest hook 获取（通过组件内调用保证类型安全）
// 注意：此组件内部通过 request from 'umi' 调用 API

const HomePage: React.FC = () => {
  const seo = useSEO({
    title: '首页',
    description: '若风的个人技术博客，专注前端开发，分享 React、TypeScript、Node.js 等技术文章与实践经验。',
    keywords: '若风,前端博客,React,TypeScript,Node.js,技术分享',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: '若风的博客',
      url: 'https://www.xiaodingyang.art',
      potentialAction: {
        '@type': 'SearchAction',
        target: 'https://www.xiaodingyang.art/articles?keyword={search_term_string}',
        'query-input': 'required name=search_term_string',
      },
    },
  });
  const { data: articlesData, isLoading: articlesLoading } = useArticles({ page: 1, pageSize: 6 });
  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const { data: tags, isLoading: tagsLoading } = useTags();
  const loading = articlesLoading || categoriesLoading || tagsLoading;
  const articles = articlesData?.list ?? [];
  const articleCount = articlesData?.total ?? 0;
  const [currentSection, setCurrentSection] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const { themeId: colorThemeId } = useModel('colorModel');
  const currentColorTheme = getColorThemeById(colorThemeId);

  const sections = ['hero', 'articles', 'explore'];
  const sectionCount = sections.length;

  const heroParticles = useMemo(() =>
    Array.from({ length: 10 }, (_, i) => ({
      id: i,
      size: Math.random() * 6 + 2,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      delay: `${Math.random() * 2}s`,
    })), []);

  const featuredArticles = useMemo(
    () => [...articles].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 3),
    [articles],
  );
  const latestArticles = useMemo(
    () => [...articles].slice(0, 3),
    [articles],
  );

  const recommendArticles = useMemo(() => {
    const readIds = getReadArticleIds();
    const unread = articles.filter(a => !readIds.has(a._id || ''));
    return sortByPopularity(unread).slice(0, 3);
  }, [articles]);

  // 侧边文章列表：合并最新+推荐，去重，排除主推，最多5篇
  const sideArticles = useMemo(() => {
    const mainId = featuredArticles[0]?._id;
    const seen = new Set<string>();
    const result: API.Article[] = [];
    for (const a of [...latestArticles, ...recommendArticles]) {
      const id = a._id || '';
      if (id && id !== mainId && !seen.has(id)) {
        seen.add(id);
        result.push(a);
      }
      if (result.length >= 5) break;
    }
    return result;
  }, [featuredArticles, latestArticles, recommendArticles]);

  /** 与 CSS `.home-fullscreen-section` 实际高度一致（含 100dvh），避免 innerHeight 与 dvh 不一致导致圆点错位 */
  const getSectionHeight = useCallback(() => {
    const container = containerRef.current;
    const el = container?.querySelector('.home-fullscreen-section') as HTMLElement | null;
    if (el && el.offsetHeight > 0) return el.offsetHeight;
    const NAVBAR_HEIGHT = 64;
    return window.innerHeight - NAVBAR_HEIGHT;
  }, []);

  useEffect(() => {
    if (loading) return;
    const container = containerRef.current;
    if (!container) return;

    let rafId = 0;
    const syncFromScroll = () => {
      const scrollTop = container.scrollTop;
      const height = getSectionHeight();
      if (height <= 0) return;
      const viewH = container.clientHeight;
      const center = scrollTop + viewH / 2;
      const index = Math.floor(center / height);
      setCurrentSection(Math.min(Math.max(0, index), sectionCount - 1));
    };

    const handleScroll = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        syncFromScroll();
        rafId = 0;
      });
    };

    const ro = new ResizeObserver(() => {
      syncFromScroll();
    });
    ro.observe(container);
    const firstSection = container.querySelector('.home-fullscreen-section');
    if (firstSection) ro.observe(firstSection);

    container.addEventListener('scroll', handleScroll, { passive: true });
    syncFromScroll();

    return () => {
      ro.disconnect();
      container.removeEventListener('scroll', handleScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [loading, getSectionHeight, sectionCount]);

  const scrollToSection = (index: number) => {
    const container = containerRef.current;
    if (!container) return;
    const height = getSectionHeight();
    container.scrollTo({
      top: index * height,
      behavior: 'smooth',
    });
  };

  if (loading) {
    return <HomeSkeleton />;
  }

  return (
    <div
      ref={containerRef}
      className="home-fullscreen-scroll h-full overflow-y-auto relative"
      style={{
        scrollSnapType: 'y mandatory',
        scrollBehavior: 'smooth',
        zIndex: 10,
        position: 'relative',
      }}
    >
      {seo}
      {/* 导航点指示器 - 移动端隐藏 */}
      <div className="hidden md:flex fixed right-4 lg:right-6 top-1/2 transform -translate-y-1/2 z-50 flex-col gap-3">
        {sections.map((_, index) => {
          const isActive = currentSection === index;
          return (
            <button
              key={index}
              onClick={() => scrollToSection(index)}
              style={{
                outline: 'none',
                width: 12,
                height: 12,
                borderRadius: '50%',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                transform: isActive ? 'scale(1.3)' : 'scale(1)',
                background: isActive
                  ? currentColorTheme.primary
                  : `${currentColorTheme.primary}55`,
                boxShadow: isActive
                  ? `0 0 12px ${currentColorTheme.primary}99`
                  : 'none',
              }}
            />
          );
        })}
      </div>

      {/* ========== 第一屏：Hero ========== */}
      <section
        className="home-fullscreen-section w-full relative flex items-center justify-center overflow-hidden"
        style={{ background: 'transparent', position: 'relative', zIndex: 10 }}
      >
        {/* 动态背景 - 动态渐变 + 毛玻璃覆盖 */}
        <div className="absolute inset-0">
          {/* 动态渐变背景 - 完全透明，让粒子特效完全显示 */}
          <div
            className="absolute inset-0 hero-gradient-bg"
            style={{
              background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e, #0f0c29)',
              backgroundSize: '300% 300%',
              animation: 'heroGradientShift 8s ease infinite',
              opacity: 0,
            }}
          />
          {/* 毛玻璃覆盖层 - 移除以显示粒子特效 */}
          <div
            className="absolute inset-0"
            style={{
              backdropFilter: 'blur(0px)',
              background: 'rgba(0, 0, 0, 0)',
            }}
          />
          {/* 渐变光晕 - 移除以显示粒子特效 */}
          <div
            className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full opacity-0 blur-3xl"
            style={{ background: `radial-gradient(circle, ${currentColorTheme.primary} 0%, transparent 70%)` }}
          />
          <div
            className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full opacity-0 blur-3xl"
            style={{ background: `radial-gradient(circle, ${currentColorTheme.primary} 0%, transparent 70%)` }}
          />
          {/* 浮动粒子 */}
          {heroParticles.map((p) => (
            <div
              key={p.id}
              className="absolute rounded-full animate-pulse"
              style={{
                width: p.size,
                height: p.size,
                left: p.left,
                top: p.top,
                background: currentColorTheme.primary,
                animationDelay: p.delay,
                opacity: 0.6,
              }}
            />
          ))}
        </div>

        <motion.div
          className="relative z-10 max-w-6xl mx-auto px-4 md:px-6 flex flex-col lg:flex-row items-center gap-4 md:gap-8 lg:gap-16"
          variants={sectionVariants}
          initial="hidden"
          animate={currentSection === 0 ? 'visible' : 'hidden'}
        >
          {/* 左侧文字 */}
          <div className="flex-1 text-center lg:text-left">
            <motion.div
            className="flex items-center gap-2 px-3 py-1.5 md:px-5 md:py-2.5 rounded-full bg-white/10 backdrop-blur-sm mb-4 md:mb-8 border border-white/10"
            variants={itemVariants}
            >
            <RocketOutlined className="text-yellow-400 text-base md:text-lg" />
            <span className="text-white/90 text-xs md:text-sm font-medium">探索技术的无限可能</span>
          </motion.div>

            <motion.h1
              className="!mb-4 md:!mb-8"
              style={{
                fontSize: 'clamp(2rem, 6vw, 5rem)',
                fontWeight: 800,
                lineHeight: 1.1,
                letterSpacing: '-0.03em',
                margin: 0,
              }}
              variants={itemVariants}
            >
              <span className="gradient-text-white">
                代码改变世界
              </span>
              <br />
              <span
                className="gradient-text-dynamic"
                style={{
                  ['--gradient-color' as any]: currentColorTheme.primary,
                  ['--gradient-color-end' as any]: (() => {
                    // 根据主题色提供配对的渐变结束色
                    const gradientEndColors: Record<string, string> = {
                      pink: '#ffd700',      // 金黄色
                      rose: '#ff8a65',      // 珊瑚橙
                      lavender: '#60a5fa',  // 天蓝色
                      ocean: '#a78bfa',     // 薰衣草紫
                      mint: '#34d399',      // 翠绿色
                      amber: '#fbbf24',     // 琥珀黄
                      coral: '#fca5a5',     // 浅珊瑚
                      violet: '#c084fc',    // 浅紫色
                      cyan: '#22d3ee',      // 亮青色
                      peach: '#fda4af',     // 浅桃红
                    };
                    return gradientEndColors[colorThemeId] || '#ffd700';
                  })(),
                }}
              >
                记录成长轨迹
              </span>
            </motion.h1>

            <motion.div className="!text-gray-400 !text-base md:!text-xl !mb-4 md:!mb-10 max-w-lg mx-auto lg:mx-0 leading-relaxed" variants={itemVariants}>
              <span className="typewriter-text">
                热爱编程 ✨ 分享技术 🚀 记录成长
              </span>
            </motion.div>

            <motion.div className="flex flex-wrap justify-center lg:justify-start gap-3 md:gap-5" variants={itemVariants}>
              <Link to="/articles">
                <MotionButton
                  className="!h-11 md:!h-14 !px-6 md:!px-10 !rounded-full !font-bold !text-sm md:!text-base !border-none cursor-pointer"
                  style={{
                    background: currentColorTheme.gradient,
                    boxShadow: `0 10px 40px ${currentColorTheme.primary}66`,
                    color: '#fff',
                    border: 'none',
                  }}
                >
                  开始探索 <ArrowRightOutlined />
                </MotionButton>
              </Link>
              <Link to="/about">
                <MotionButton
                  className="!h-11 md:!h-14 !px-6 md:!px-10 !rounded-full !font-bold !text-sm md:!text-base !border-0 cursor-pointer"
                  style={{
                    background: 'rgba(0, 0, 0, 0.25)',
                    backdropFilter: 'blur(12px)',
                    color: '#fff',
                    boxShadow: 'inset 0 0 0 1px rgba(255, 255, 255, 0.2)',
                  }}
                >
                  <CodeOutlined /> 关于作者
                </MotionButton>
              </Link>
            </motion.div>
            <motion.div className="flex justify-center lg:justify-start gap-4 md:gap-6 lg:gap-12 mt-4 md:mt-10 lg:mt-16" variants={itemVariants}>
              {[
                { label: '文章', value: articleCount || '0', icon: '📝' },
                { label: '分类', value: categories.length || '0', icon: '📂' },
                { label: '标签', value: tags.length || '0', icon: '🏷️' },
              ].map((item, i) => (
                <div
                  key={i}
                  className="text-center"
                  style={{
                    textShadow: '0 2px 8px rgba(0, 0, 0, 0.3), 0 4px 16px rgba(0, 0, 0, 0.2)',
                  }}
                >
                  <div
                    className="text-2xl md:text-4xl font-bold text-white mb-0.5 md:mb-1"
                    style={{
                      textShadow: '0 2px 12px rgba(0, 0, 0, 0.4), 0 4px 20px rgba(0, 0, 0, 0.3)',
                    }}
                  >
                    {item.value}
                  </div>
                  <div
                    className="text-gray-500 text-xs md:text-sm"
                    style={{
                      textShadow: '0 1px 4px rgba(0, 0, 0, 0.3), 0 2px 8px rgba(0, 0, 0, 0.2)',
                      color: 'rgba(255, 255, 255, 0.9)',
                    }}
                  >
                    {item.icon} {item.label}
                  </div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* 右侧装饰 */}
          <div className="flex-1 hidden lg:block">
            <div className="relative">
              {/* 代码块装饰 */}
              <div
                className="relative bg-gray-900/80 rounded-2xl p-8 backdrop-blur-sm border border-white/10"
                style={{ boxShadow: '0 30px 80px rgba(0,0,0,0.5)' }}
              >
                <div className="flex gap-2 mb-6">
                  <div className="w-3.5 h-3.5 rounded-full bg-red-500" />
                  <div className="w-3.5 h-3.5 rounded-full bg-yellow-500" />
                  <div className="w-3.5 h-3.5 rounded-full bg-green-500" />
                </div>
                <pre className="text-base text-gray-300 font-mono leading-relaxed">
                  <code>
                    <span className="text-purple-400">const</span>{' '}
                    <span style={{ color: currentColorTheme.primary }}>developer</span> = {'{'}
                    {'\n'}  <span className="text-green-400">name</span>:{' '}
                    <span className="text-yellow-400">"肖定阳"</span>,
                    {'\n'}  <span className="text-green-400">experience</span>:{' '}
                    <span className="text-yellow-400">"8年"</span>,
                    {'\n'}  <span className="text-green-400">skills</span>: [
                    {'\n'}    <span className="text-yellow-400">"React"</span>,
                    {'\n'}    <span className="text-yellow-400">"Vue"</span>,
                    {'\n'}    <span className="text-yellow-400">"TypeScript"</span>
                    {'\n'}  ],
                    {'\n'}  <span className="text-green-400">passion</span>:{' '}
                    <span className="text-yellow-400">"∞"</span>
                    {'\n'}{'}'};
                  </code>
                </pre>
              </div>
              {/* 浮动卡片 */}
              <div
                className="absolute -top-6 -right-6 rounded-2xl p-5 text-white"
                style={{
                  background: currentColorTheme.gradient,
                  boxShadow: `0 15px 50px ${currentColorTheme.primary}66`,
                }}
              >
                <FireOutlined className="text-3xl" />
              </div>
            </div>
          </div>
        </motion.div>
        <div
          onClick={() => scrollToSection(1)}
          className="absolute bottom-3 md:bottom-8 left-1/2 transform -translate-x-1/2 cursor-pointer"
          style={{ animation: 'modernBounce 2s ease-in-out infinite' }}
        >
          <div className="flex flex-col items-center gap-1 md:gap-2">
            <span
              className="text-xs md:text-sm font-medium px-3 py-1 md:px-4 md:py-1.5 rounded-full"
              style={{
                background: 'rgba(0, 0, 0, 0.2)',
                backdropFilter: 'blur(8px)',
                color: 'rgba(255, 255, 255, 0.9)',
              }}
            >
              向下滚动
            </span>
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{
                background: 'rgba(0, 0, 0, 0.2)',
                backdropFilter: 'blur(8px)',
              }}
            >
              <ArrowDownOutlined style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: 14 }} />
            </div>
          </div>
        </div>
      </section>

      {/* ========== 第二屏：文章（精选+列表合并） ========== */}
      <section
        className="home-fullscreen-section w-full relative flex flex-col"
        style={{ background: 'transparent', position: 'relative', zIndex: 10 }}
      >
        <motion.div
          className="home-fullscreen-section-inner w-full flex flex-col py-6 md:py-10"
          variants={sectionVariants}
          initial="hidden"
          animate={currentSection === 1 ? 'visible' : 'hidden'}
        >
        <div className="max-w-6xl mx-auto px-4 md:px-6 w-full">
          {/* 标题行 */}
          <motion.div className="flex items-center justify-between mb-6 md:mb-8" variants={itemVariants}>
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 md:w-9 md:h-9 rounded-lg flex items-center justify-center text-sm"
                style={{ background: `${currentColorTheme.primary}22`, color: currentColorTheme.primary }}
              >
                <FireOutlined />
              </div>
              <Title level={3} className="!mb-0 !text-lg md:!text-2xl !text-white">
                精选文章
              </Title>
            </div>
            <Link to="/articles">
              <span
                className="text-xs md:text-sm font-medium transition-colors hover:underline"
                style={{ color: currentColorTheme.primary }}
              >
                查看全部 →
              </span>
            </Link>
          </motion.div>

          {/* 主体 */}
          {featuredArticles.length > 0 ? (
            <motion.div className="grid grid-cols-1 lg:grid-cols-12 gap-5 md:gap-6" variants={itemVariants}>
              {/* 左侧主推大卡 */}
              <div className="lg:col-span-7">
                <Link to={`/article/${featuredArticles[0]?._id}`} className="block group h-full">
                  <div
                    className="relative overflow-hidden rounded-2xl h-full min-h-[240px] md:min-h-[360px]"
                    style={{
                      background: featuredArticles[0]?.cover ? undefined : currentColorTheme.gradient,
                    }}
                  >
                    {featuredArticles[0]?.cover && (
                      <OptimizedImage
                        src={featuredArticles[0].cover}
                        alt=""
                        loading="lazy"
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    )}
                    <div
                      className="absolute inset-0"
                      style={{
                        background: featuredArticles[0]?.cover
                          ? 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.35) 50%, rgba(0,0,0,0.1) 100%)'
                          : 'none',
                      }}
                    />
                    <div className="relative z-10 p-5 md:p-8 h-full flex flex-col justify-end">
                      <Tag className="!bg-white/20 !border-none !text-white !rounded-full !px-3 !py-0.5 !text-xs !w-fit !mb-2">
                        {featuredArticles[0]?.category?.name || '未分类'}
                      </Tag>
                      <Title level={3} className="!text-white !mt-0 !mb-2 !text-lg md:!text-2xl lg:!text-3xl group-hover:!underline !leading-tight">
                        {featuredArticles[0]?.title}
                      </Title>
                      <Paragraph className="!text-white/70 !text-xs md:!text-sm !mb-3 line-clamp-2">
                        {featuredArticles[0]?.summary}
                      </Paragraph>
                      <div className="flex items-center justify-between">
                        <Space className="text-white/65 text-xs">
                          <EyeOutlined /> {featuredArticles[0]?.views || 0}
                          <span>·</span>
                          <ClockCircleOutlined /> {formatDate(featuredArticles[0]?.createdAt)}
                        </Space>
                        <div
                          className="w-9 h-9 rounded-full flex items-center justify-center transition-all group-hover:scale-110"
                          style={{ background: `${currentColorTheme.primary}44` }}
                        >
                          <ArrowRightOutlined className="text-white text-sm" />
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>

              {/* 右侧文章列表 */}
              <div className="lg:col-span-5 flex flex-col">
                <div
                  className="rounded-2xl flex-1 flex flex-col"
                  style={{
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                  }}
                >
                  {sideArticles.map((article, index) => (
                    <Link key={article._id} to={`/article/${article._id}`} className="block group">
                      <div
                        className={`flex items-center gap-3.5 p-4 md:p-5 transition-colors ${index < sideArticles.length - 1 ? 'border-b' : ''}`}
                        style={{ borderColor: 'rgba(255,255,255,0.06)' }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        {/* 序号 */}
                        <div
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
                          style={{
                            background: index < 2 ? `${currentColorTheme.primary}22` : 'rgba(255,255,255,0.06)',
                            color: index < 2 ? currentColorTheme.primary : 'rgba(255,255,255,0.4)',
                          }}
                        >
                          {String(index + 1).padStart(2, '0')}
                        </div>
                        {/* 缩略图 */}
                        {article.cover && (
                          <div className="w-16 h-12 md:w-20 md:h-14 rounded-lg overflow-hidden flex-shrink-0">
                            <img
                              src={article.cover}
                              alt=""
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                            />
                          </div>
                        )}
                        {/* 文字 */}
                        <div className="flex-1 min-w-0">
                          <div className="text-white text-xs md:text-sm font-medium truncate group-hover:underline transition-colors">
                            {article.title}
                          </div>
                          <div className="flex items-center gap-2 mt-1 text-gray-500 text-xs">
                            <span><EyeOutlined /> {article.views || 0}</span>
                            <span>·</span>
                            <span>{formatDate(article.createdAt)}</span>
                          </div>
                        </div>
                        <ArrowRightOutlined className="text-white/0 group-hover:text-white/60 transition-colors flex-shrink-0 text-xs" />
                      </div>
                    </Link>
                  ))}
                  {sideArticles.length === 0 && (
                    <div className="flex-1 flex items-center justify-center text-gray-500 text-sm">暂无更多文章</div>
                  )}
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div className="text-center text-gray-500 py-12" variants={itemVariants}>暂无文章</motion.div>
          )}

          {/* 底部引用点缀 */}
          <motion.div className="mt-6 md:mt-8 flex items-center justify-center gap-3 px-4" variants={itemVariants}>
            <div className="h-px flex-1 max-w-[60px]" style={{ background: 'rgba(255,255,255,0.1)' }} />
            <DailyQuote />
            <div className="h-px flex-1 max-w-[60px]" style={{ background: 'rgba(255,255,255,0.1)' }} />
          </motion.div>
        </div>
        </motion.div>
      </section>

      {/* ========== 第三屏：探索 + CTA ========== */}
      <section
        className="home-fullscreen-section w-full relative flex flex-col"
        style={{ background: 'transparent', position: 'relative', zIndex: 10 }}
      >
        <motion.div
          className="home-fullscreen-section-inner w-full flex flex-col py-6 md:py-10"
          variants={sectionVariants}
          initial="hidden"
          animate={currentSection === 2 ? 'visible' : 'hidden'}
        >
        <div className="max-w-6xl mx-auto px-4 md:px-6 w-full">
          {/* 上半部分：分类 + 标签 */}
          <motion.div className="grid grid-cols-1 lg:grid-cols-5 gap-5 md:gap-6 mb-8 md:mb-10" variants={itemVariants}>
            {/* 分类 - 占 3 列，网格卡片 */}
            <div className="lg:col-span-3">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <FolderOutlined style={{ color: currentColorTheme.primary, fontSize: 14 }} />
                  <span className="text-white font-semibold text-sm">文章分类</span>
                </div>
                <Link to="/categories" className="text-xs hover:underline" style={{ color: currentColorTheme.primary }}>
                  全部 →
                </Link>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                {categories.slice(0, 6).map((cat, index) => {
                  const hue = index * 50;
                  return (
                    <Link key={cat._id} to={`/category/${cat._id}`}>
                      <div
                        className="group rounded-xl p-4 md:p-5 transition-all duration-300 cursor-pointer hover:-translate-y-1"
                        style={{
                          background: 'rgba(255, 255, 255, 0.04)',
                          border: '1px solid rgba(255, 255, 255, 0.06)',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = `rgba(255, 255, 255, 0.08)`;
                          e.currentTarget.style.borderColor = `hsl(${hue}, 70%, 55%, 0.3)`;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
                          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.06)';
                        }}
                      >
                        <div
                          className="w-9 h-9 md:w-10 md:h-10 rounded-xl flex items-center justify-center text-white text-sm mb-2.5"
                          style={{
                            background: `linear-gradient(135deg, hsl(${hue}, 70%, 55%) 0%, hsl(${hue + 30}, 70%, 45%) 100%)`,
                            boxShadow: `0 4px 12px hsl(${hue}, 70%, 45%, 0.3)`,
                          }}
                        >
                          <FolderOutlined />
                        </div>
                        <div className="text-white text-xs md:text-sm font-medium truncate group-hover:text-white/100 text-white/80">
                          {cat.name}
                        </div>
                        <div className="text-gray-500 text-xs mt-0.5">
                          {cat.articleCount || 0} 篇文章
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
              {categories.length === 0 && <div className="text-center py-6 text-gray-500 text-sm">暂无分类</div>}
            </div>

            {/* 标签云 - 占 2 列 */}
            <div className="lg:col-span-2">
              <div
                className="rounded-2xl p-5 md:p-6 h-full"
                style={{
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                }}
              >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <TagsOutlined style={{ color: currentColorTheme.primary }} />
                  <span className="text-white font-semibold text-sm md:text-base">热门标签</span>
                </div>
                <Link to="/tags" className="text-xs hover:underline" style={{ color: currentColorTheme.primary }}>
                  全部 →
                </Link>
              </div>
              <div className="flex flex-wrap gap-2.5">
                {tags.map((tag) => (
                  <Link key={tag._id} to={`/tag/${tag._id}`}>
                    <span
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer"
                      style={{
                        background: 'rgba(255, 255, 255, 0.06)',
                        color: 'rgba(255, 255, 255, 0.6)',
                        border: '1px solid rgba(255, 255, 255, 0.06)',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = `${currentColorTheme.primary}22`;
                        e.currentTarget.style.color = currentColorTheme.primary;
                        e.currentTarget.style.borderColor = `${currentColorTheme.primary}33`;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
                        e.currentTarget.style.color = 'rgba(255, 255, 255, 0.6)';
                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.06)';
                      }}
                    >
                      # {tag.name}
                      <span style={{ opacity: 0.45 }}>({tag.articleCount || 0})</span>
                    </span>
                  </Link>
                ))}
                {tags.length === 0 && <div className="text-center py-4 text-gray-500 text-sm w-full">暂无标签</div>}
              </div>
            </div>
          </div>
          </motion.div>

          {/* 下半部分：CTA */}
          <motion.div
            className="rounded-2xl p-6 md:p-8 text-center relative overflow-hidden"
            className="rounded-2xl p-6 md:p-8 text-center relative overflow-hidden"
            variants={itemVariants}
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
            }}
          >
            {/* 光晕装饰 */}
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[200px] rounded-full opacity-15 blur-3xl pointer-events-none"
              style={{ background: `radial-gradient(circle, ${currentColorTheme.primary} 0%, transparent 70%)` }}
            />
            <div className="relative z-10">
              <Title level={3} className="!text-white !mb-2 !text-xl md:!text-2xl">
                👋 想要了解更多？
              </Title>
              <Text className="text-gray-400 text-sm md:text-base block mb-4 md:mb-6">
                欢迎留言交流，期待与你的每一次对话
              </Text>
              <div className="flex flex-wrap justify-center gap-3">
                <Link to="/message">
                  <MotionButton
                    className="!h-10 md:!h-11 !px-6 md:!px-8 !rounded-full !font-semibold !text-sm !border-none cursor-pointer"
                    style={{
                      background: currentColorTheme.gradient,
                      color: 'white',
                      boxShadow: `0 8px 30px ${currentColorTheme.primary}44`,
                    }}
                  >
                    💬 留言交流
                  </MotionButton>
                </Link>
                <Link to="/about">
                  <MotionButton
                    className="!h-10 md:!h-11 !px-6 md:!px-8 !rounded-full !font-semibold !text-sm !border-0 cursor-pointer"
                    style={{
                      background: 'rgba(255, 255, 255, 0.06)',
                      color: 'rgba(255,255,255,0.8)',
                      boxShadow: 'inset 0 0 0 1px rgba(255, 255, 255, 0.12)',
                    }}
                  >
                    🙋 关于我
                  </MotionButton>
                </Link>
              </div>
            </div>
          </motion.div>

          {/* 底部备案信息 */}
          <motion.div className="text-center mt-6 md:mt-8" variants={itemVariants}>
            <Text style={{ color: 'rgba(255, 255, 255, 0.35)', fontSize: 12 }}>
              © {new Date().getFullYear()} 个人博客. All rights reserved.{' '}
              <a
                href="https://beian.miit.gov.cn/"
                target="_blank"
                rel="noreferrer"
                style={{ color: 'rgba(255,255,255,0.25)' }}
              >
                蜀ICP备2026005106号
              </a>
            </Text>
          </motion.div>
        </div>
        </motion.div>
      </section>
    </div>
  );
};

export default HomePage;
