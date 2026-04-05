import React, { useMemo } from 'react';
import { Link } from 'umi';
import { Card, Tag, Space, Typography, Avatar } from 'antd';
import { EyeOutlined, ClockCircleOutlined, FolderOutlined, UserOutlined, FireOutlined } from '@ant-design/icons';
import { useModel } from 'umi';
import { getColorThemeById } from '@/config/colorThemes';
import ShareButton from '@/components/ShareButton';
import OptimizedImage from '@/components/OptimizedImage';
import { fetchArticleDetail } from '@/utils/prefetch';
import dayjs from 'dayjs';

const { Title, Paragraph, Text } = Typography;

interface ArticleCardProps {
  article: API.Article;
  style?: React.CSSProperties;
}

// 判断文章是否为"新"（7天内发布）
const isNewArticle = (createdAt: string): boolean => {
  const publishDate = dayjs(createdAt);
  const now = dayjs();
  return now.diff(publishDate, 'day') <= 7;
};

// 判断文章是否为"热门"（浏览量超过 1000）
const isHotArticle = (views?: number): boolean => {
  return (views || 0) >= 1000;
};

const ArticleCard: React.FC<ArticleCardProps> = React.memo(({ article, style }) => {
  const { themeId: colorThemeId } = useModel('colorModel');
  const currentColorTheme = getColorThemeById(colorThemeId);
  const articleId = article._id || (article as API.Article & { id?: string }).id;

  // 计算文章状态
  const isNew = useMemo(() => isNewArticle(article.createdAt), [article.createdAt]);
  const isHot = useMemo(() => isHotArticle(article.views), [article.views]);

  return (
    <Link to={articleId ? `/article/${articleId}` : '/articles'} className="no-underline" onMouseEnter={() => { if (articleId) fetchArticleDetail(articleId); }}>
      <Card
        hoverable
        className="card-hover overflow-hidden"
        style={{ 
          borderRadius: 12,
          border: '1px solid rgba(255, 255, 255, 0.2)',
          background: 'rgba(255, 255, 255, 0.15)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          ...style,
        }}
        cover={
          article.cover ? (
            <div className="relative h-40 md:h-48 overflow-hidden">
              <OptimizedImage
                alt={article.title}
                src={article.cover}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              {/* 左下角：分类标签 */}
              <div className="absolute bottom-3 md:bottom-4 left-3 md:left-4">
                <Tag
                  className="!border-none !text-white !px-2 md:!px-3 !py-0.5 md:!py-1 !rounded-lg !text-xs md:!text-sm"
                  style={{
                    background: 'rgba(255, 255, 255, 0.2)',
                    backdropFilter: 'blur(8px)',
                    WebkitBackdropFilter: 'blur(8px)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                  }}
                >
                  <FolderOutlined className="mr-1" />
                  {article.category?.name || '未分类'}
                </Tag>
              </div>
              {/* 右上角：新/热门标签 */}
              {(isNew || isHot) && (
                <div className="absolute top-3 md:top-4 right-3 md:right-4 flex gap-2">
                  {isHot && (
                    <Tag
                      className="!border-none !px-2 !py-0.5 !rounded-lg !text-xs !font-medium"
                      style={{
                        background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%)',
                        color: '#fff',
                        boxShadow: '0 2px 8px rgba(255, 107, 107, 0.4)',
                      }}
                    >
                      <FireOutlined className="mr-1" />
                      热门
                    </Tag>
                  )}
                  {isNew && (
                    <Tag
                      className="!border-none !px-2 !py-0.5 !rounded-lg !text-xs !font-medium"
                      style={{
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        color: '#fff',
                        boxShadow: '0 2px 8px rgba(16, 185, 129, 0.4)',
                      }}
                    >
                      新
                    </Tag>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div 
              className="h-40 md:h-48 flex items-center justify-center"
              style={{
                background: currentColorTheme.gradient, // 主题色渐变
              }}
            >
              <Title level={2} className="!text-white !mb-0 opacity-20">
                {article.title.charAt(0)}
              </Title>
            </div>
          )
        }
      >
        <div className="space-y-2 md:space-y-3">
          {/* 标题 */}
          <Title 
            level={5} 
            ellipsis={{ rows: 1 }}
            className="!mb-0 hover:text-primary transition-colors !text-sm md:!text-base"
            style={{ 
              color: '#1e293b',
              textShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            }}
          >
            {article.title}
          </Title>

          {/* 摘要 */}
          <Paragraph 
            ellipsis={{ rows: 2 }}
            className="!mb-0 text-gray-500 !text-xs md:!text-sm"
            style={{
              textShadow: '0 1px 2px rgba(0, 0, 0, 0.08)',
            }}
          >
            {article.summary || '暂无摘要'}
          </Paragraph>

          {/* 标签 */}
          <div className="flex flex-wrap gap-1">
            {article.tags?.slice(0, 2).map(tag => (
              <Tag 
                key={tag._id} 
                className="!border-gray-200 !bg-gray-50 !text-gray-600 !text-xs"
              >
                {tag.name}
              </Tag>
            ))}
            {article.tags?.length > 2 && (
              <Tag className="!border-gray-200 !bg-gray-50 !text-gray-400 !text-xs">
                +{article.tags.length - 2}
              </Tag>
            )}
          </div>

          {/* 底部信息 */}
          <div className="flex items-center justify-between pt-2 md:pt-3 border-t border-gray-100">
            <Space size={4}>
              <Avatar 
                size={20} 
                icon={<UserOutlined />}
                src={article.author?.avatar}
                style={{ background: currentColorTheme.primary }}
              />
              <Text className="text-gray-500 text-xs md:text-sm">
                {article.author?.username || '匿名'}
              </Text>
            </Space>
            <Space 
              className="text-gray-400 text-xs md:text-sm" 
              split={<span className="mx-0.5 md:mx-1">·</span>}
              style={{
                textShadow: '0 1px 2px rgba(0, 0, 0, 0.08)',
              }}
            >
              <span>
                <EyeOutlined className="mr-0.5 md:mr-1" />
                {article.views || 0}
              </span>
              <span>
                <ClockCircleOutlined className="mr-0.5 md:mr-1" />
                {dayjs(article.createdAt).format('MM-DD')}
              </span>
              {/* Bug Fix #8: 移除外层 span 的 onClick={e.preventDefault()}，否则可能阻止 ShareButton 的正常交互 */}
              <ShareButton
                title={article.title}
                summary={article.summary || ''}
                url={articleId ? `https://www.xiaodingyang.art/article/${articleId}` : undefined}
                cover={article.cover}
                mode="icon"
              />
            </Space>
          </div>
        </div>
      </Card>
    </Link>
  );
});

export default ArticleCard;
