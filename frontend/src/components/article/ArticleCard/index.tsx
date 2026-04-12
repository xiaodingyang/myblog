import React, { useMemo } from 'react';
import { Link } from 'umi';
import { Card, Tag, Space, Typography, Avatar } from 'antd';
import { EyeOutlined, ClockCircleOutlined, FolderOutlined, UserOutlined, FireOutlined } from '@ant-design/icons';
import { useModel } from 'umi';
import { getColorThemeById } from '@/config/colorThemes';
import ShareButton from '@/components/shared/ShareButton';
import OptimizedImage from '@/components/shared/OptimizedImage';
import { fetchArticleDetail } from '@/utils/prefetch';
import dayjs from 'dayjs';
import { themeBg, isNewArticle, isHotArticle, artId } from '@/utils/themeHelpers';

const { Title, Paragraph, Text } = Typography;

interface ArticleCardProps {
  article: API.Article;
  style?: React.CSSProperties;
}

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
        className="card-hover glass-card overflow-hidden group"
        style={{
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
          transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
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
                        background: currentColorTheme.gradient,
                        color: '#fff',
                        boxShadow: `0 2px 8px ${themeBg(currentColorTheme.primary, 0.4)}`,
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
                        background: `linear-gradient(135deg, ${currentColorTheme.primary}88 0%, ${currentColorTheme.primary} 100%)`,
                        color: '#fff',
                        boxShadow: `0 2px 8px ${themeBg(currentColorTheme.primary, 0.35)}`,
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
        <div className="space-y-3 md:space-y-4">
          {/* 标题 */}
          <Title 
            level={5} 
            ellipsis={{ rows: 1 }}
            className="!mb-1 hover:text-primary transition-colors !text-sm md:!text-base !text-white/90"
            style={{ 
              textShadow: '0 1px 6px rgba(0, 0, 0, 0.3)',
            }}
          >
            {article.title}
          </Title>

          {/* 摘要 */}
          <Paragraph 
            ellipsis={{ rows: 2 }}
            className="!mb-3 !text-white/50 !text-xs md:!text-sm"
            style={{
              textShadow: '0 1px 4px rgba(0, 0, 0, 0.2)',
            }}
          >
            {article.summary || '暂无摘要'}
          </Paragraph>

          {/* 标签 */}
          <div className="flex flex-wrap gap-1.5">
            {article.tags?.slice(0, 2).map(tag => (
              <Tag 
                key={tag._id} 
                className="!border-white/20 !bg-white/10 !text-white/70 !text-xs"
              >
                {tag.name}
              </Tag>
            ))}
            {article.tags?.length > 2 && (
              <Tag className="!border-white/20 !bg-white/10 !text-white/60 !text-xs">
                +{article.tags.length - 2}
              </Tag>
            )}
          </div>

          {/* 底部信息 */}
          <div className="flex items-center justify-between pt-3 md:pt-4 border-t border-white/10">
            <Space size={4}>
              <Avatar 
                size={20} 
                icon={<UserOutlined />}
                src={article.author?.avatar}
                style={{ background: currentColorTheme.primary }}
              />
              <Text className="!text-white/65 text-xs md:text-sm">
                {article.author?.username || '匿名'}
              </Text>
            </Space>
            <Space 
              className="!text-white/60 text-xs md:text-sm" 
              split={<span className="mx-0.5 md:mx-1">·</span>}
              style={{
                textShadow: '0 1px 4px rgba(0, 0, 0, 0.2)',
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
