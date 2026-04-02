import React, { useEffect, useState } from 'react';
import { Timeline, Typography, Tag } from 'antd';
import { ClockCircleOutlined, FileTextOutlined, CalendarOutlined } from '@ant-design/icons';
import { Link } from 'umi';
import { request, useModel } from 'umi';
import { getColorThemeById } from '@/config/colorThemes';
import Empty from '@/components/Empty';
import useSEO from '@/hooks/useSEO';

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
        <div className="h-8 w-24 rounded-lg bg-gray-200 animate-pulse mb-4" />
        <div className="space-y-3 pl-6 border-l-2 border-gray-100">
          {[1, 2, 3].map((m) => (
            <div key={m} className="space-y-2">
              <div className="h-5 w-16 rounded bg-gray-200 animate-pulse" />
              {[1, 2].map((a) => (
                <div key={a} className="flex items-center gap-3 py-1">
                  <div className="h-4 w-12 rounded bg-gray-100 animate-pulse" />
                  <div className="h-4 flex-1 rounded bg-gray-100 animate-pulse" style={{ maxWidth: 280 }} />
                  <div className="h-5 w-14 rounded-full bg-gray-100 animate-pulse" />
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
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<MonthGroup[]>([]);
  const { themeId: colorThemeId } = useModel('colorModel');
  const currentColorTheme = getColorThemeById(colorThemeId);

  useSEO({
    title: '文章归档',
    description: '按时间线浏览若风技术博客的所有文章归档。',
    keywords: '文章归档,技术博客,时间线',
  });

  useEffect(() => {
    const fetchArchives = async () => {
      setLoading(true);
      try {
        const res = await request<API.Response<MonthGroup[]>>('/api/articles/archives', {
          params: { limit: 200 },
        });
        if (res.code === 0) {
          setData(res.data || []);
        }
      } catch (error) {
        // handled
      } finally {
        setLoading(false);
      }
    };
    fetchArchives();
  }, []);

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
      <div className="max-w-4xl mx-auto px-4 md:px-6">
        {/* 页面标题 */}
        <div className="text-center mb-12">
          <div
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
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

        {/* 内容区域 */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-lg relative z-10" style={{ minHeight: 300 }}>
          {loading ? (
            <ArchivesSkeleton />
          ) : data.length === 0 ? (
            <Empty description="暂无文章" />
          ) : (
            sortedYears.map((year) => {
              const months = yearMap.get(year)!.sort((a, b) => b.month - a.month);
              return (
                <div key={year} className="mb-10 last:mb-0">
                  {/* 年份标题 */}
                  <div className="flex items-center gap-3 mb-6">
                    <div
                      className="text-3xl font-bold"
                      style={{ color: currentColorTheme.primary }}
                    >
                      {year}
                    </div>
                    <div className="flex-1 h-px bg-gray-200" />
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
                            <span className="text-gray-400 text-sm font-normal ml-2">
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
                                className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors group"
                              >
                                <Text className="text-gray-400 text-xs flex-shrink-0" style={{ minWidth: 48 }}>
                                  {new Date(article.createdAt).toLocaleDateString('zh-CN', {
                                    month: '2-digit',
                                    day: '2-digit',
                                  })}
                                </Text>
                                <span
                                  className="flex-1 text-gray-700 group-hover:text-current transition-colors truncate"
                                  style={{ '--hover-color': currentColorTheme.primary } as React.CSSProperties}
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
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default Archives;
