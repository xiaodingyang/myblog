import React from 'react';
import { Timeline, Typography, Tag } from 'antd';
import { ClockCircleOutlined, FileTextOutlined, CalendarOutlined } from '@ant-design/icons';
import { Link, useModel } from 'umi';
import { getColorThemeById } from '@/config/colorThemes';
import { themeBg } from '@/utils/themeHelpers';
import Empty from '@/components/shared/Empty';
import useSEO from '@/hooks/useSEO';
import { useArchives } from '@/hooks/useQueries';
import ScrollReveal from '@/components/visual/ScrollReveal';

const { Title, Text } = Typography;

interface ArticleItem {
  id?: string;
  _id?: string;
  title: string;
  createdAt: string;
  category: string;
}

interface MonthGroup {
  year: number;
  month: number;
  articles: ArticleItem[];
}

const monthNames = ['一月', '二月', '三月', '四月', '五月', '六月',
  '七月', '八月', '九月', '十月', '十一月', '十二月'];

// 骨架屏
const ArchivesSkeleton: React.FC = () => (
  <div className="space-y-8">
    {[1, 2].map((y) => (
      <div key={y}>
        <div className="h-8 w-24 rounded-card-sm bg-white/10 animate-pulse mb-4" />
        <div className="space-y-3 pl-6 border-l-2 border-white/10">
          {[1, 2, 3].map((m) => (
            <div key={m} className="space-y-2">
              <div className="h-5 w-16 rounded bg-white/10 animate-pulse" />
              {[1, 2].map((a) => (
                <div key={a} className="flex items-center gap-3 py-1">
                  <div className="h-4 w-12 rounded bg-white/6 animate-pulse" />
                  <div className="h-4 flex-1 rounded bg-white/6 animate-pulse" style={{ maxWidth: 280 }} />
                  <div className="h-5 w-14 rounded-full bg-white/6 animate-pulse" />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    ))}
  </div>
);

const Archives: React.FC = () => {
  const { themeId: colorThemeId } = useModel('colorModel');
  const currentColorTheme = getColorThemeById(colorThemeId);

  const { data: data = [], isLoading: loading } = useArchives();

  const seo = useSEO({
    title: '文章归档',
    description: '按时间线浏览若风技术博客的所有文章归档。',
    keywords: '文章归档,技术博客,时间线',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: '文章归档 - 若风的博客',
      url: 'https://www.xiaodingyang.art/archives',
      description: '按时间线浏览若风技术博客的所有文章归档',
    },
  });

  // 按年分组
  const yearMap = new Map<number, MonthGroup[]>();
  data.forEach((group) => {
    if (!yearMap.has(group.year)) {
      yearMap.set(group.year, []);
    }
    yearMap.get(group.year)!.push(group);
  });
  const sortedYears = Array.from(yearMap.keys()).sort((a, b) => b - a);

  // 统计总文章数
  const totalArticles = data.reduce((sum, g) => sum + g.articles.length, 0);

  return (
    <div className="animate-fade-in py-8">
      {seo}
      <div className="max-w-4xl mx-auto px-4 md:px-6">
        {/* 页面标题 */}
        <ScrollReveal direction="up">
        <div className="text-center mb-12">
          <div
            className="inline-flex items-center justify-center w-16 h-16 rounded-card-lg mb-4"
            style={{ background: currentColorTheme.gradient }}
          >
            <CalendarOutlined className="text-3xl text-white" />
          </div>
          <Title
            level={1}
            className="!mb-3 !text-white"
            style={{ textShadow: '0 2px 24px rgba(0, 0, 0, 0.45)' }}
          >
            文章归档
          </Title>
          <Text
            className="!text-white/85 text-lg"
            style={{ textShadow: '0 1px 12px rgba(0, 0, 0, 0.35)' }}
          >
            共 {totalArticles} 篇文章，记录成长轨迹
          </Text>
        </div>
        </ScrollReveal>

        {/* 内容区域 - 玻璃拟态风格 */}
        <div className="rounded-card-lg p-5 md:p-8 relative z-10" style={{
          minHeight: 300,
          background: themeBg(currentColorTheme.primary, 0.12),
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: `1px solid ${themeBg(currentColorTheme.primary, 0.18)}`,
          boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
        }}>
          {loading ? (
            <ArchivesSkeleton />
          ) : data.length === 0 ? (
            <Empty description="暂无文章" />
          ) : (
            sortedYears.map((year, yearIndex) => {
              const months = yearMap.get(year)!.sort((a, b) => b.month - a.month);
              return (
                <ScrollReveal key={year} direction="up" delay={yearIndex * 0.06}>
                <div className="mb-10 last:mb-0">
                  {/* 年份标题 */}
                  <div className="flex items-center gap-3 mb-6">
                    <div
                      className="text-3xl font-bold"
                      style={{ color: currentColorTheme.primary, textShadow: '0 1px 6px rgba(0,0,0,0.3)' }}
                    >
                      {year}
                    </div>
                    <div className="flex-1 h-px bg-white/15" />
                    <Tag
                      className="!rounded-full !px-3 !py-0.5 !border-none !text-sm"
                      style={{
                        background: `${currentColorTheme.primary}15`,
                        color: currentColorTheme.primary,
                      }}
                    >
                      {months.reduce((s, m) => s + m.articles.length, 0)} 篇
                    </Tag>
                  </div>

                  {/* 月份时间线 */}
                  <Timeline
                    items={months.map((group) => ({
                      dot: (
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center"
                          style={{
                            background: `${currentColorTheme.primary}15`,
                            color: currentColorTheme.primary,
                          }}
                        >
                          <FileTextOutlined style={{ fontSize: 14 }} />
                        </div>
                      ),
                      children: (
                        <div className="mb-4">
                          <div
                            className="text-base font-semibold mb-3"
                            style={{ color: currentColorTheme.primary }}
                          >
                            {monthNames[group.month - 1]}
                            <span className="!text-white/60 text-sm font-normal ml-2">
                              ({group.articles.length} 篇)
                            </span>
                          </div>
                          <div className="space-y-2">
                            {group.articles.map((article) => {
                              const articleId = article.id || article._id;
                              if (!articleId) return null;
                              return (
                                <Link
                                key={articleId}
                                to={`/article/${articleId}`}
                                className="flex items-center gap-3 py-2 px-3 rounded-card-sm transition-colors group"
                                style={{ background: 'transparent' }}
                                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                              >
                                <Text className="!text-white/50 text-xs flex-shrink-0" style={{ minWidth: 48 }}>
                                  {new Date(article.createdAt).toLocaleDateString('zh-CN', {
                                    month: '2-digit',
                                    day: '2-digit',
                                  })}
                                </Text>
                                <span
                                  className="flex-1 text-white/80 group-hover:text-white transition-colors truncate"
                                  onMouseEnter={(e) => (e.currentTarget.style.color = currentColorTheme.primary)}
                                  onMouseLeave={(e) => (e.currentTarget.style.color = '')}
                                >
                                  {article.title}
                                </span>
                                <Tag
                                  className="!text-xs !rounded-full !px-2 !py-0 !border-none flex-shrink-0"
                                  style={{
                                    background: `${currentColorTheme.primary}10`,
                                    color: currentColorTheme.primary,
                                  }}
                                >
                                  {article.category}
                                </Tag>
                                </Link>
                              );
                            })}
                          </div>
                        </div>
                      ),
                    }))}
                  />
                </div>
                </ScrollReveal>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default Archives;
