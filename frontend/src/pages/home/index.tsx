import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { Link } from 'umi';
import { Typography, Tag, Space, Button } from 'antd';
import { useModel } from 'umi';
import { getColorThemeById } from '@/config/colorThemes';
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
import useSEO from '@/hooks/useSEO';

// 轻量日期格式化
const formatDate = (date: string) => {
  const d = new Date(date);
  return `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const { Title, Paragraph, Text } = Typography;

// 动态获取 request
const getRequest = () => {
  // @ts-ignore
  return require('umi').request;
};

const HomePage: React.FC = () => {
  useSEO({
    title: '首页',
    description: '若风的个人技术博客，专注前端开发，分享 React、TypeScript、Node.js 等技术文章与实践经验。',
    keywords: '若风,前端博客,React,TypeScript,Node.js,技术分享',
  });
  const [loading, setLoading] = useState(true);
  const [articles, setArticles] = useState<API.Article[]>([]);
  const [articleCount, setArticleCount] = useState(0);
  const [categories, setCategories] = useState<API.Category[]>([]);
  const [tags, setTags] = useState<API.Tag[]>([]);
  const [currentSection, setCurrentSection] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const { themeId: colorThemeId } = useModel('colorModel');
  const currentColorTheme = getColorThemeById(colorThemeId);

  const sections = ['hero', 'featured', 'latest', 'explore', 'cta'];

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

  // Bug Fix #4: 将 fetchData 提取到 useCallback 中，确保 cleanup 函数引用最新版本
  // 避免组件重渲染或依赖变化时 cleanup 引用旧版 fetchData 导致数据不更新或内存泄漏
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const request = getRequest();
      const [articlesRes, categoriesRes, tagsRes] = await Promise.all([
        request<API.Response<API.PageResult<API.Article>>>('/api/articles', {
          params: { page: 1, pageSize: 6 },
        }),
        request<API.Response<API.Category[]>>('/api/categories'),
        request<API.Response<API.Tag[]>>('/api/tags'),
      ]);

      if (articlesRes.code === 0) {
        setArticles(articlesRes.data.list);
        setArticleCount(articlesRes.data.total);
      }
      if (categoriesRes.code === 0) setCategories(categoriesRes.data);
      if (tagsRes.code === 0) setTags(tagsRes.data);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if ('requestIdleCallback' in window) {
      const id = requestIdleCallback(() => fetchData());
      return () => cancelIdleCallback(id);
    } else {
      const timer = setTimeout(() => fetchData(), 200);
      return () => clearTimeout(timer);
    }
  }, [fetchData]);

  // 计算实际 section 高度
  // Bug Fix #7: 动态获取导航栏高度，不再硬编码 64px
  // 导航栏高度定义在 FrontLayout.tsx 的 Header style 中 (height: 64)
  // 使用固定值 64 是安全的，因为导航栏高度本身是固定的 64px
  // 此处保留注释说明：如果未来导航栏高度变化，需要同步更新此值
  const NAVBAR_HEIGHT = 64; // 固定导航栏高度，与 FrontLayout.tsx 保持一致
  const getActualSectionHeight = () => window.innerHeight - NAVBAR_HEIGHT;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let rafId = 0;
    const handleScroll = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        const scrollTop = container.scrollTop;
        const height = getActualSectionHeight();
        const index = Math.round(scrollTop / height);
        setCurrentSection(Math.min(index, sections.length - 1));
        rafId = 0;
      });
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      container.removeEventListener('scroll', handleScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  // 滚动到指定区域
  const scrollToSection = (index: number) => {
    const container = containerRef.current;
    if (!container) return;
    const height = getActualSectionHeight();
    container.scrollTo({
      top: index * height,
      behavior: 'smooth',
    });
  };

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
      {/* 导航点指示器 - 移动端隐藏 */}
      <div className="hidden md:flex fixed right-4 lg:right-6 top-1/2 transform -translate-y-1/2 z-50 flex-col gap-3">
        {sections.map((_, index) => {
          const isActive = currentSection === index;
          // 根据当前屏幕决定颜色（深色屏用白色，浅色屏用深色）
          const isDarkSection = currentSection === 0 || currentSection === 4;
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
                  ? isDarkSection ? '#fff' : '#1f2937'
                  : isDarkSection ? 'rgba(255,255,255,0.3)' : 'rgba(107,114,128,0.5)',
                boxShadow: isActive
                  ? isDarkSection
                    ? '0 0 12px rgba(255,255,255,0.6)'
                    : '0 0 12px rgba(0,0,0,0.3)'
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
        {/* 动态背景 */}
        <div className="absolute inset-0">
          {/* 网格背景 */}
          <div
            className="absolute inset-0 opacity-5"
            style={{
              backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                               linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
              backgroundSize: '50px 50px',
            }}
          />
          {/* 渐变光晕 */}
          <div
            className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full opacity-30 blur-3xl"
            style={{ background: `radial-gradient(circle, ${currentColorTheme.primary} 0%, transparent 70%)` }} // 主题色光晕
          />
          <div
            className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full opacity-20 blur-3xl"
            style={{ background: `radial-gradient(circle, ${currentColorTheme.primary} 0%, transparent 70%)` }} // 主题色光晕
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

        <div className="relative z-10 max-w-6xl mx-auto px-4 md:px-6 flex flex-col lg:flex-row items-center gap-4 md:gap-8 lg:gap-16">
          {/* 左侧文字 */}
          <div className="flex-1 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 md:px-5 md:py-2.5 rounded-full bg-white/10 backdrop-blur-sm mb-4 md:mb-8 border border-white/10">
              <RocketOutlined className="text-yellow-400 text-base md:text-lg" />
              <span className="text-white/90 text-xs md:text-sm font-medium">探索技术的无限可能</span>
            </div>

            <h1
              className="!mb-4 md:!mb-8"
              style={{
                fontSize: 'clamp(2rem, 6vw, 5rem)',
                fontWeight: 800,
                lineHeight: 1.1,
                letterSpacing: '-0.03em',
                margin: 0,
              }}
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
            </h1>

            <Paragraph className="!text-gray-400 !text-base md:!text-xl !mb-4 md:!mb-10 max-w-lg mx-auto lg:mx-0 leading-relaxed">
              在这里分享编程技术、学习心得与项目经验。
              <br className="hidden md:block" />每一行代码都是通往未来的阶梯。
            </Paragraph>

            <div className="flex flex-wrap justify-center lg:justify-start gap-3 md:gap-5">
              <Link to="/articles">
                <Button
                  size="large"
                  className="!h-11 md:!h-14 !px-6 md:!px-10 !rounded-full !font-bold !text-sm md:!text-base !border-none"
                  style={{
                    background: currentColorTheme.gradient,
                    boxShadow: `0 10px 40px ${currentColorTheme.primary}66`, // 主题色阴影
                    color: '#fff',
                    border: 'none',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = currentColorTheme.gradient;
                    e.currentTarget.style.opacity = '0.9';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = currentColorTheme.gradient;
                    e.currentTarget.style.opacity = '1';
                  }}
                >
                  开始探索 <ArrowRightOutlined />
                </Button>
              </Link>
              <Link to="/about">
                <Button
                  size="large"
                  className="!h-11 md:!h-14 !px-6 md:!px-10 !rounded-full !font-bold !text-sm md:!text-base !border-0"
                  style={{
                    background: 'rgba(0, 0, 0, 0.25)',
                    backdropFilter: 'blur(12px)',
                    color: '#fff',
                    boxShadow: 'inset 0 0 0 1px rgba(255, 255, 255, 0.2)',
                  }}
                >
                  <CodeOutlined /> 关于作者
                </Button>
              </Link>
            </div>

            {/* 统计数据 */}
            <div className="flex justify-center lg:justify-start gap-4 md:gap-6 lg:gap-12 mt-4 md:mt-10 lg:mt-16">
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
            </div>
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
        </div>

        {/* 向下滚动提示 */}
        <div
          onClick={() => scrollToSection(1)}
          className="absolute bottom-3 md:bottom-8 left-1/2 transform -translate-x-1/2 cursor-pointer"
          style={{ animation: 'bounce 2s infinite' }}
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

      {/* ========== 第二屏：精选文章 ========== */}
      <section
        className="home-fullscreen-section w-full relative flex flex-col"
        style={{ background: 'transparent', position: 'relative', zIndex: 10 }}
      >
        <div className="home-fullscreen-section-inner w-full flex flex-col py-6 md:py-8">
        <div className="max-w-6xl mx-auto px-4 md:px-6 w-full">
          <div className="text-center mb-4 md:mb-8 lg:mb-12 bg-white/95 backdrop-blur-sm rounded-2xl p-4 md:p-6 shadow-lg">
            <div className="inline-flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-full bg-orange-100 text-orange-600 mb-3 md:mb-4 text-sm md:text-base">
              <FireOutlined />
              <span className="font-medium">热门推荐</span>
            </div>
            <Title
              level={2}
              className="!text-2xl md:!text-4xl lg:!text-5xl !mb-2 md:!mb-4"
              style={{
                textShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
              }}
            >
              精选文章
            </Title>
            <Text
              className="text-gray-500 text-lg"
              style={{
                textShadow: '0 1px 4px rgba(0, 0, 0, 0.08)',
              }}
            >
              探索最受欢迎的技术内容
            </Text>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6">
              {/* 主推文章骨架屏 */}
              <div className="lg:col-span-7">
                <div className="relative overflow-hidden rounded-2xl md:rounded-3xl h-full min-h-[280px] md:min-h-[400px] bg-gray-800/50 animate-pulse" />
              </div>
              {/* 次要文章骨架屏 */}
              <div className="lg:col-span-5 flex flex-col gap-4 md:gap-6">
                <div className="relative overflow-hidden rounded-2xl h-[180px] md:h-[190px] bg-gray-800/50 animate-pulse" />
                <div className="relative overflow-hidden rounded-2xl h-[180px] md:h-[190px] bg-gray-800/50 animate-pulse" />
              </div>
            </div>
          ) : featuredArticles.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6">
              {/* 主推文章 */}
              <div className="lg:col-span-7">
                <Link to={`/article/${featuredArticles[0]?._id}`} className="block group h-full">
                  <div
                    className="relative overflow-hidden rounded-2xl md:rounded-3xl h-full min-h-[280px] md:min-h-[400px]"
                    style={{
                      background: currentColorTheme.gradient,
                    }}
                  >
                    <div className="absolute inset-0 opacity-10">
                      <div className="absolute top-10 right-10 w-40 h-40 border-2 border-white rounded-full" />
                      <div className="absolute bottom-10 left-10 w-24 h-24 border-2 border-white rounded-full" />
                    </div>
                    <div className="relative z-10 p-6 md:p-10 h-full flex flex-col justify-between">
                      <div>
                        <Tag className="!bg-white/20 !border-none !text-white !rounded-full !px-3 md:!px-4 !py-1 !text-xs md:!text-sm">
                          {featuredArticles[0]?.category?.name || '未分类'}
                        </Tag>
                        <Title level={2} className="!text-white !mt-4 md:!mt-6 !mb-2 md:!mb-4 !text-xl md:!text-3xl lg:!text-4xl group-hover:!underline">
                          {featuredArticles[0]?.title}
                        </Title>
                        <Paragraph className="!text-white/80 !text-sm md:!text-lg !mb-0 line-clamp-2 md:line-clamp-3">
                          {featuredArticles[0]?.summary}
                        </Paragraph>
                      </div>
                      <div className="flex items-center justify-between mt-6">
                        <Space className="text-white/70">
                          <EyeOutlined /> {featuredArticles[0]?.views || 0} 阅读
                          <span className="mx-2">·</span>
                          <ClockCircleOutlined /> {formatDate(featuredArticles[0]?.createdAt)}
                        </Space>
                        <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-all">
                          <ArrowRightOutlined className="text-white text-lg" />
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>

              {/* 次推文章 - Bug Fix #11: slice(1, 3) 确保最多 2 个次推文章，防止数组越界 */}
              <div className="lg:col-span-5 flex flex-col gap-6">
                {featuredArticles.slice(1, 3).map((article, index) => (
                  <Link key={article._id} to={`/article/${article._id}`} className="block group flex-1">
                    <div
                      className="relative overflow-hidden rounded-3xl h-full min-h-[185px]"
                      style={{
                        background: index === 0
                          ? currentColorTheme.gradient
                          : 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                      }}
                    >
                      <div className="relative z-10 p-8 h-full flex flex-col justify-between">
                        <div>
                          <Tag className="!bg-white/20 !border-none !text-white !rounded-full !px-3">
                            {article.category?.name || '未分类'}
                          </Tag>
                          <Title level={4} className="!text-white !mt-4 !mb-0 group-hover:!underline line-clamp-2">
                            {article.title}
                          </Title>
                        </div>
                        <div className="flex items-center justify-between">
                          <Space className="text-white/70 text-sm">
                            <EyeOutlined /> {article.views || 0}
                          </Space>
                          <ArrowRightOutlined className="text-white/60 group-hover:text-white transition-colors" />
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-400">暂无文章</div>
          )}

          <div className="text-center mt-10">
            <Link to="/articles">
              <button
                className="group inline-flex items-center gap-2 px-8 py-3 rounded-full font-semibold text-base transition-all duration-300 hover:scale-105 hover:shadow-lg"
                style={{
                  background: 'transparent',
                  border: `2px solid ${currentColorTheme.primary}`,
                  color: currentColorTheme.primary,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = currentColorTheme.gradient;
                  e.currentTarget.style.color = '#fff';
                  e.currentTarget.style.borderColor = 'transparent';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = currentColorTheme.primary;
                  e.currentTarget.style.borderColor = currentColorTheme.primary;
                }}
              >
                查看全部文章
                <ArrowRightOutlined className="transition-transform duration-300 group-hover:translate-x-1" />
              </button>
            </Link>
          </div>
        </div>
        </div>
      </section>

      {/* ========== 第三屏：最新发布 ========== */}
      <section
        className="home-fullscreen-section w-full relative flex flex-col"
        style={{ background: 'transparent', position: 'relative', zIndex: 10 }}
      >
        <div className="home-fullscreen-section-inner w-full flex flex-col py-6 md:py-8">
        <div className="max-w-6xl mx-auto px-4 md:px-6 w-full">
          <div className="text-center mb-4 md:mb-8 lg:mb-12 bg-white/95 backdrop-blur-sm rounded-2xl p-4 md:p-6 shadow-lg">
            <div
              className="inline-flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-full mb-3 md:mb-4 text-sm md:text-base"
              style={{
                background: `${currentColorTheme.primary}20`,
                color: currentColorTheme.primary,
              }}
            >
              <ClockCircleOutlined />
              <span className="font-medium">最新动态</span>
            </div>
            <Title
              level={2}
              className="!text-2xl md:!text-4xl lg:!text-5xl !mb-2 md:!mb-4"
              style={{
                textShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
              }}
            >
              最新发布
            </Title>
            <Text
              className="text-gray-500 text-lg"
              style={{
                textShadow: '0 1px 4px rgba(0, 0, 0, 0.08)',
              }}
            >
              持续更新的技术分享
            </Text>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-3xl overflow-hidden h-full">
                  <div className="h-52 bg-gray-200 animate-pulse" />
                  <div className="p-6 space-y-3">
                    <div className="h-6 bg-gray-200 rounded animate-pulse" />
                    <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
                    <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : latestArticles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
              {latestArticles.map((article, index) => (
                <Link key={article._id} to={`/article/${article._id}`} className="block group">
                  <div
                    className="bg-white rounded-3xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 h-full"
                    style={{ boxShadow: '0 10px 40px rgba(0,0,0,0.08)' }}
                  >
                    <div className="relative h-52 overflow-hidden">
                      {article.cover ? (
                        <img
                          src={article.cover}
                          alt={article.title}
                          loading="lazy"
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          style={{ backgroundColor: '#f3f4f6' }}
                        />
                      ) : (
                        <div
                          className="w-full h-full flex items-center justify-center"
                          style={{
                            background: `linear-gradient(135deg, hsl(${(index * 60) % 360}, 70%, 60%) 0%, hsl(${(index * 60 + 40) % 360}, 70%, 50%) 100%)`,
                          }}
                        >
                          <BookOutlined className="text-6xl text-white/30" />
                        </div>
                      )}
                      <div className="absolute top-4 left-4">
                        <Tag className="!border-none !rounded-full !px-3 !py-1 !bg-white/95 !backdrop-blur">
                          <FolderOutlined className="mr-1" />
                          {article.category?.name || '未分类'}
                        </Tag>
                      </div>
                    </div>

                    <div className="p-6">
                      <Title
                        level={5}
                        className="!mb-3 transition-colors truncate"
                        style={{
                          '--hover-color': currentColorTheme.primary,
                          textShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                        } as React.CSSProperties & { '--hover-color': string }}
                        onMouseEnter={(e) => e.currentTarget.style.color = currentColorTheme.primary}
                        onMouseLeave={(e) => e.currentTarget.style.color = ''}
                      >
                        {article.title}
                      </Title>
                      <Paragraph
                        className="!text-gray-500 !mb-4 !text-sm line-clamp-2"
                        style={{
                          textShadow: '0 1px 2px rgba(0, 0, 0, 0.08)',
                        }}
                      >
                        {article.summary || '暂无摘要'}
                      </Paragraph>

                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <Space className="text-gray-400 text-xs">
                          <span><EyeOutlined /> {article.views || 0}</span>
                          <span><ClockCircleOutlined /> {formatDate(article.createdAt)}</span>
                        </Space>
                        <span
                          className="text-sm font-medium group-hover:underline"
                          style={{ color: currentColorTheme.primary }}
                        >
                          阅读 →
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-400">暂无文章</div>
          )}
        </div>
        </div>
      </section>

      {/* ========== 第四屏：分类与标签 ========== */}
      <section
        className="home-fullscreen-section w-full relative flex flex-col"
        style={{ background: 'transparent', position: 'relative', zIndex: 10 }}
      >
        <div className="home-fullscreen-section-inner w-full flex flex-col py-6 md:py-8">
        <div className="max-w-6xl mx-auto px-4 md:px-6 w-full">
          <div className="text-center mb-4 md:mb-8 lg:mb-12 bg-white/95 backdrop-blur-sm rounded-2xl p-4 md:p-6 shadow-lg">
            <div
              className="inline-flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-full mb-3 md:mb-4 text-sm md:text-base"
              style={{
                background: `${currentColorTheme.primary}20`,
                color: currentColorTheme.primary,
              }}
            >
              <TagsOutlined />
              <span className="font-medium">内容导航</span>
            </div>
            <Title
              level={2}
              className="!text-2xl md:!text-4xl lg:!text-5xl !mb-2 md:!mb-4"
              style={{
                textShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
              }}
            >
              探索更多
            </Title>
            <Text
              className="text-gray-500 text-sm md:text-lg"
              style={{
                textShadow: '0 1px 4px rgba(0, 0, 0, 0.08)',
              }}
            >
              按分类和标签浏览内容
            </Text>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8">
            {/* 分类 */}
            <div className="bg-white rounded-2xl md:rounded-3xl p-4 md:p-8" style={{ boxShadow: '0 10px 40px rgba(0,0,0,0.06)' }}>
              <div className="flex items-center justify-between mb-6">
                <Title
                  level={3}
                  className="!mb-0 !text-2xl"
                  style={{
                    textShadow: '0 1px 4px rgba(0, 0, 0, 0.08)',
                  }}
                >
                  <FolderOutlined className="mr-2" style={{ color: currentColorTheme.primary }} />
                  文章分类
                </Title>
                <Link
                  to="/categories"
                  className="hover:underline font-medium"
                  style={{ color: currentColorTheme.primary }}
                >
                  全部 →
                </Link>
              </div>
              <div className="space-y-4">
                {categories.slice(0, 4).map((cat, index) => (
                  <Link key={cat._id} to={`/category/${cat._id}`}>
                    <div className="flex items-center justify-between p-5 rounded-2xl hover:bg-gray-50 transition-colors group cursor-pointer">
                      <div className="flex items-center gap-4">
                        <div
                          className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-xl"
                          style={{
                            background: `linear-gradient(135deg, hsl(${index * 50}, 70%, 55%) 0%, hsl(${index * 50 + 30}, 70%, 45%) 100%)`,
                          }}
                        >
                          <FolderOutlined />
                        </div>
                        <div>
                          <div
                            className="font-semibold text-lg transition-colors"
                            style={{
                              textShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.color = currentColorTheme.primary}
                            onMouseLeave={(e) => e.currentTarget.style.color = ''}
                          >
                            {cat.name}
                          </div>
                          <div
                            className="text-gray-400 text-sm mt-1 line-clamp-1"
                            style={{
                              textShadow: '0 1px 2px rgba(0, 0, 0, 0.08)',
                            }}
                          >
                            {cat.description || '暂无描述'}
                          </div>
                        </div>
                      </div>
                      <Tag color="pink" className="!rounded-full !text-sm !px-4 !py-1">
                        {cat.articleCount || 0} 篇
                      </Tag>
                    </div>
                  </Link>
                ))}
                {categories.length === 0 && (
                  <div className="text-center py-8 text-gray-400">暂无分类</div>
                )}
              </div>
            </div>

            {/* 标签云 */}
            <div className="bg-white rounded-2xl md:rounded-3xl p-4 md:p-8" style={{ boxShadow: '0 10px 40px rgba(0,0,0,0.06)' }}>
              <div className="flex items-center justify-between mb-6">
                <Title
                  level={3}
                  className="!mb-0 !text-2xl"
                  style={{
                    textShadow: '0 1px 4px rgba(0, 0, 0, 0.08)',
                  }}
                >
                  <TagsOutlined className="mr-2" style={{ color: currentColorTheme.primary }} />
                  热门标签
                </Title>
                <Link
                  to="/tags"
                  className="hover:underline font-medium"
                  style={{ color: currentColorTheme.primary }}
                >
                  全部 →
                </Link>
              </div>
              <div className="flex flex-wrap gap-3">
                {tags.map((tag, index) => {
                  const colors = [
                    'hover:opacity-80',
                    'hover:opacity-80',
                    'hover:opacity-80',
                    'bg-green-50 text-green-600 hover:bg-green-100',
                    'bg-orange-50 text-orange-600 hover:bg-orange-100',
                    'bg-cyan-50 text-cyan-600 hover:bg-cyan-100',
                  ];
                  return (
                    <Link key={tag._id} to={`/tag/${tag._id}`}>
                      <span
                        className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-colors cursor-pointer ${colors[index % colors.length]}`}
                      >
                        # {tag.name}
                        <span className="opacity-60">({tag.articleCount || 0})</span>
                      </span>
                    </Link>
                  );
                })}
                {tags.length === 0 && (
                  <div className="text-center py-8 text-gray-400 w-full">暂无标签</div>
                )}
              </div>
            </div>
          </div>
        </div>
        </div>
      </section>

      {/* ========== 第五屏：CTA ========== */}
      <section
        className="home-fullscreen-section w-full relative flex flex-col items-center justify-center"
        style={{ background: 'transparent', position: 'relative', zIndex: 10 }}
      >
        {/* 背景装饰 */}
        <div className="absolute inset-0 overflow-hidden">
          <div
            className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full opacity-20 blur-3xl"
            style={{ background: `radial-gradient(circle, ${currentColorTheme.primary} 0%, transparent 70%)` }} // 主题色光晕
          />
          <div
            className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full opacity-20 blur-3xl"
            style={{ background: `radial-gradient(circle, ${currentColorTheme.primary} 0%, transparent 70%)` }} // 主题色光晕
          />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 md:px-6 text-center bg-black/50 backdrop-blur-sm rounded-2xl md:rounded-3xl p-6 md:p-12 shadow-2xl">
          <div className="mb-4 md:mb-8">
            <span className="text-4xl md:text-6xl">👋</span>
          </div>

          <Title
            level={1}
            className="!text-white !mb-4 md:!mb-6"
            style={{ fontSize: 'clamp(1.5rem, 6vw, 4rem)', fontWeight: 800 }}
          >
            想要了解更多？
          </Title>

          <Paragraph className="!text-gray-400 !text-base md:!text-xl !mb-8 md:!mb-12 max-w-2xl mx-auto">
            欢迎访问留言板与我交流，或者查看关于页面了解更多信息。
            期待与你的每一次对话！
          </Paragraph>

          <div className="flex flex-wrap justify-center gap-3 md:gap-6">
            <Link to="/message">
              <Button
                size="large"
                className="!h-12 md:!h-16 !px-6 md:!px-12 !rounded-full !font-bold !text-sm md:!text-lg !border-none"
                style={{
                  background: currentColorTheme.gradient, // 主题色渐变
                  color: 'white',
                  boxShadow: `0 10px 40px ${currentColorTheme.primary}66`, // 主题色阴影
                }}
              >
                💬 留言交流
              </Button>
            </Link>
            <Link to="/about">
              <Button
                size="large"
                ghost
                className="!h-12 md:!h-16 !px-6 md:!px-12 !rounded-full !font-bold !text-sm md:!text-lg !text-white !border-white/30 hover:!bg-white/10"
              >
                🙋 关于我
              </Button>
            </Link>
          </div>
        </div>

        {/* 底部信息 - 相对于 section 定位，留出安全区 */}
        <div className="home-cta-footer absolute bottom-4 md:bottom-8 left-0 right-0 text-center z-10">
          <Text
            className="text-gray-500 text-xs md:text-sm"
            style={{
              textShadow: '0 1px 4px rgba(0, 0, 0, 0.3), 0 2px 8px rgba(0, 0, 0, 0.2)',
              color: 'rgba(255, 255, 255, 0.8)',
            }}
          >
            © {new Date().getFullYear()} 个人博客. All rights reserved.{' '}
            <a
              href="https://beian.miit.gov.cn/"
              target="_blank"
              rel="noreferrer"
              style={{ color: 'rgba(255,255,255,0.6)' }}
            >
              蜀ICP备2026005106号
            </a>
          </Text>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
