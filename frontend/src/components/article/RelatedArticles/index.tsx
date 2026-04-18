import React, { useEffect, useState } from 'react';
import { Link } from 'umi';
import { Card, Typography, Space, Skeleton } from 'antd';
import { EyeOutlined, FolderOutlined } from '@ant-design/icons';
import { request } from 'umi';
import { getColorThemeById } from '@/config/colorThemes';
import { useModel } from 'umi';
import { getReadArticleIds } from '@/utils/recommend';
import { BORDER_RADIUS, FONT_SIZE, BOX_SHADOW } from '@/styles/designTokens';

const { Title, Text } = Typography;

interface RelatedArticlesProps {
  categoryId?: string;
  excludeId?: string;
  tagIds?: string[];
}

const RelatedArticles: React.FC<RelatedArticlesProps> = ({
  categoryId,
  excludeId,
  tagIds,
}) => {
  const [articles, setArticles] = useState<API.Article[]>([]);
  const [loading, setLoading] = useState(true);
  const { themeId: colorThemeId } = useModel('colorModel');
  const currentColorTheme = getColorThemeById(colorThemeId);

  useEffect(() => {
    if (!categoryId && (!tagIds || tagIds.length === 0)) {
      setLoading(false);
      return;
    }

    const fetchRelated = async () => {
      setLoading(true);
      try {
        const readIds = getReadArticleIds();
        let collected: API.Article[] = [];
        const excludeIds = new Set<string>(excludeId ? [excludeId] : []);

        // 1. 先按标签查询（取前2个标签）
        if (tagIds && tagIds.length > 0) {
          const topTags = tagIds.slice(0, 2);
          for (const tagId of topTags) {
            if (collected.length >= 3) break;
            const res = await request<API.Response<API.PageResult<API.Article>>>('/api/articles', {
              params: { page: 1, pageSize: 6, tag: tagId },
            });
            if (res.code === 0) {
              for (const a of res.data.list || []) {
                const aid = a._id || '';
                if (!excludeIds.has(aid) && !readIds.has(aid)) {
                  collected.push(a);
                  excludeIds.add(aid);
                }
              }
            }
          }
        }

        // 2. 不足3个，补同分类
        if (collected.length < 3 && categoryId) {
          const res = await request<API.Response<API.PageResult<API.Article>>>('/api/articles', {
            params: { page: 1, pageSize: 6, category: categoryId },
          });
          if (res.code === 0) {
            for (const a of res.data.list || []) {
              if (collected.length >= 3) break;
              const aid = a._id || '';
              if (!excludeIds.has(aid) && !readIds.has(aid)) {
                collected.push(a);
                excludeIds.add(aid);
              }
            }
          }
        }

        // 3. 仍不足，补热门（不排除已读）
        if (collected.length < 3) {
          const res = await request<API.Response<API.PageResult<API.Article>>>('/api/articles', {
            params: { page: 1, pageSize: 6, sort: '-views' },
          });
          if (res.code === 0) {
            for (const a of res.data.list || []) {
              if (collected.length >= 3) break;
              const aid = a._id || '';
              if (!excludeIds.has(aid)) {
                collected.push(a);
                excludeIds.add(aid);
              }
            }
          }
        }

        setArticles(collected.slice(0, 3));
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };

    fetchRelated();
  }, [categoryId, excludeId, tagIds?.join(',')]);

  if (loading) {
    return (
      <Card
        className="mt-8"
        style={{
          borderRadius: BORDER_RADIUS.CARD_LARGE,
          border: 'none',
          boxShadow: BOX_SHADOW.SMALL,
        }}
      >
        <Title level={4} className="!mb-6">📋 相关推荐</Title>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i}>
              <Skeleton.Image active style={{ width: '100%', height: 120 }} />
              <Skeleton active paragraph={{ rows: 2 }} />
            </div>
          ))}
        </div>
      </Card>
    );
  }

  if (articles.length === 0) {
    return null;
  }

  return (
    <Card
      className="mt-8"
      style={{
        borderRadius: BORDER_RADIUS.CARD_LARGE,
        border: 'none',
        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
      }}
    >
      <style>{`
        @keyframes related-fade-in {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      <Title level={4} className="!mb-6">
        📋 相关推荐
      </Title>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {articles.map((article, index) => (
          <Link
            key={article._id}
            to={`/article/${article._id}`}
            className="block group"
            style={{
              opacity: 0,
              animation: `related-fade-in 0.5s ease forwards`,
              animationDelay: `${index * 100}ms`,
            }}
            data-nav-next={index === 0 ? `/article/${article._id}` : undefined}
            data-nav-prev={index === articles.length - 1 ? `/article/${article._id}` : undefined}
          >
            <Card
              hoverable
              className="h-full !rounded-card-lg overflow-hidden transition-all duration-300 group-hover:shadow-lg"
              cover={
                article.cover ? (
                  <img
                    src={article.cover}
                    alt={article.title}
                    style={{ height: 120, objectFit: 'cover' }}
                  />
                ) : (
                  <div
                    style={{
                      height: 120,
                      background: currentColorTheme.gradient,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <span style={{ fontSize: 32 }}>📝</span>
                  </div>
                )
              }
              bodyStyle={{ padding: 12 }}
            >
              <Text
                strong
                className="block mb-2 line-clamp-2 transition-colors group-hover:text-blue-500"
                style={{ fontSize: FONT_SIZE.HEADING_SMALL }}
              >
                {article.title}
              </Text>
              <Space size="small" className="text-gray-400 text-xs">
                <EyeOutlined />
                <span>{article.views || 0}</span>
              </Space>
            </Card>
          </Link>
        ))}
      </div>
    </Card>
  );
};

export default RelatedArticles;
