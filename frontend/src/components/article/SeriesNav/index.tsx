import React, { useEffect, useState } from 'react';
import { Link } from 'umi';
import { Card, Typography, Space } from 'antd';
import { OrderedListOutlined, LeftOutlined, RightOutlined } from '@ant-design/icons';
import { request } from 'umi';
import { useModel } from 'umi';
import { getColorThemeById } from '@/config/colorThemes';

const { Title, Text } = Typography;

interface SeriesArticle {
  _id: string;
  title: string;
  seriesOrder: number;
}

interface SeriesNavProps {
  seriesId: string;
  seriesTitle?: string;
  currentArticleId: string;
}

const SeriesNav: React.FC<SeriesNavProps> = ({ seriesId, seriesTitle, currentArticleId }) => {
  const [articles, setArticles] = useState<SeriesArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const { themeId: colorThemeId } = useModel('colorModel');
  const currentColorTheme = getColorThemeById(colorThemeId);

  useEffect(() => {
    if (!seriesId) return;
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await request(`/api/series/${seriesId}/articles`);
        if (res.code === 0) setArticles(res.data || []);
      } catch {} finally { setLoading(false); }
    };
    fetch();
  }, [seriesId]);

  if (loading || articles.length === 0) return null;

  const currentIdx = articles.findIndex(a => a._id === currentArticleId);
  const prev = currentIdx > 0 ? articles[currentIdx - 1] : null;
  const next = currentIdx < articles.length - 1 ? articles[currentIdx + 1] : null;

  return (
    <Card
      className="mt-8"
      style={{
        borderRadius: 16, border: 'none',
        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
      }}
    >
      <div className="flex items-center gap-2 mb-4">
        <OrderedListOutlined style={{ color: currentColorTheme.primary, fontSize: 18 }} />
        <Title level={5} className="!mb-0">
          {seriesTitle || '系列文章'}
        </Title>
        <Text type="secondary" className="text-sm">({articles.length} 篇)</Text>
      </div>

      {/* Article list */}
      <div className="space-y-1 mb-4 max-h-[240px] overflow-y-auto">
        {articles.map((a, i) => {
          const isCurrent = a._id === currentArticleId;
          return (
            <Link
              key={a._id}
              to={`/article/${a._id}`}
              className="block"
            >
              <div
                className="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors"
                style={{
                  background: isCurrent ? `${currentColorTheme.primary}15` : 'transparent',
                  borderLeft: isCurrent ? `3px solid ${currentColorTheme.primary}` : '3px solid transparent',
                }}
              >
                <Text
                  type="secondary"
                  className="text-xs w-6 text-center shrink-0"
                  style={isCurrent ? { color: currentColorTheme.primary, fontWeight: 600 } : {}}
                >
                  {i + 1}
                </Text>
                <Text
                  className="text-sm truncate"
                  style={isCurrent ? { color: currentColorTheme.primary, fontWeight: 600 } : {}}
                >
                  {a.title}
                </Text>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Prev / Next */}
      <div className="flex justify-between gap-4 pt-3 border-t border-gray-100">
        {prev ? (
          <Link to={`/article/${prev._id}`} className="flex items-center gap-1 text-sm hover:opacity-80 truncate" style={{ color: currentColorTheme.primary }}>
            <LeftOutlined className="text-xs" /> {prev.title}
          </Link>
        ) : <div />}
        {next ? (
          <Link to={`/article/${next._id}`} className="flex items-center gap-1 text-sm hover:opacity-80 truncate text-right" style={{ color: currentColorTheme.primary }}>
            {next.title} <RightOutlined className="text-xs" />
          </Link>
        ) : <div />}
      </div>
    </Card>
  );
};

export default SeriesNav;
