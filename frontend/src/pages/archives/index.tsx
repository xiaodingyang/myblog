import React, { useEffect, useState } from 'react';
import { Card, Timeline, Typography, Spin, Tag, Empty } from 'antd';
import { ClockCircleOutlined, FileTextOutlined } from '@ant-design/icons';
import { Link } from 'umi';
import useSEO from '@/hooks/useSEO';

const { Title, Text } = Typography;

interface ArticleItem {
  id: string;
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

const Archives: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<MonthGroup[]>([]);

  useSEO({ title: '🗓️ 文章归档 - 我的博客' });

  useEffect(() => {
    fetch('/api/articles/archives?limit=200')
      .then(res => res.json())
      .then(data => {
        if (data.code === 0) {
          setData(data.data || []);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 60 }}>
        <Spin size="large" />
      </div>
    );
  }

  // 构建 Timeline 数据
  const timelineItems: { year: number; monthGroups: MonthGroup[] }[] = [];
  const yearMap = new Map<number, MonthGroup[]>();

  data.forEach(group => {
    if (!yearMap.has(group.year)) {
      yearMap.set(group.year, []);
    }
    yearMap.get(group.year)!.push(group);
  });

  const sortedYears = Array.from(yearMap.keys()).sort((a, b) => b - a);
  sortedYears.forEach(year => {
    const months = yearMap.get(year)!.sort((a, b) => b.month - a.month);
    timelineItems.push({ year, monthGroups: months });
  });

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '24px 16px' }}>
      <Card
        title={
          <span>
            <ClockCircleOutlined style={{ color: '#1890ff', marginRight: 8 }} />
            🗓️ 文章归档
          </span>
        }
        style={{ borderRadius: 12 }}
      >
        {data.length === 0 ? (
          <Empty description="暂无文章" style={{ padding: 40 }} />
        ) : (
          timelineItems.map(({ year, monthGroups }) => (
            <div key={year} style={{ marginBottom: 32 }}>
              {/* 年份大标题 */}
              <div style={{
                fontSize: 28,
                fontWeight: 700,
                color: '#1890ff',
                marginBottom: 16,
                paddingBottom: 8,
                borderBottom: '2px solid #f0f0f0',
              }}>
                {year} 年
              </div>

              {/* 月份时间线 */}
              <Timeline
                items={monthGroups.map(group => ({
                  dot: <FileTextOutlined style={{ color: '#1890ff' }} />,
                  children: (
                    <div style={{ marginBottom: 12 }}>
                      <div style={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: '#666',
                        marginBottom: 6,
                      }}>
                        {monthNames[group.month - 1]}
                      </div>
                      {group.articles.map(article => (
                        <div key={article.id} style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          padding: '4px 0',
                        }}>
                          <Text type="secondary" style={{ fontSize: 12, minWidth: 60 }}>
                            {new Date(article.createdAt).toLocaleDateString('zh-CN', {
                              month: '2-digit',
                              day: '2-digit',
                            })}
                          </Text>
                          <Link to={`/articles/${article.id}`} style={{ flex: 1 }}>
                            {article.title}
                          </Link>
                          <Tag color="blue" style={{ fontSize: 11 }}>
                            {article.category}
                          </Tag>
                        </div>
                      ))}
                    </div>
                  ),
                }))}
              />
            </div>
          ))
        )}
      </Card>
    </div>
  );
};

export default Archives;
