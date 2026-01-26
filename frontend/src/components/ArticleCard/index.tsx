import React from 'react';
import { Link } from 'umi';
import { Card, Tag, Space, Typography, Avatar } from 'antd';
import { EyeOutlined, ClockCircleOutlined, FolderOutlined, UserOutlined } from '@ant-design/icons';
import { useModel } from 'umi';
import { getColorThemeById } from '@/config/colorThemes';
import dayjs from 'dayjs';

const { Title, Paragraph, Text } = Typography;

interface ArticleCardProps {
  article: API.Article;
  style?: React.CSSProperties;
}

const ArticleCard: React.FC<ArticleCardProps> = ({ article, style }) => {
  const { themeId: colorThemeId } = useModel('colorModel');
  const currentColorTheme = getColorThemeById(colorThemeId);
  
  return (
    <Link to={`/article/${article._id}`} className="no-underline">
      <Card
        hoverable
        className="card-hover overflow-hidden"
        style={{ 
          borderRadius: 16,
          border: 'none',
          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
          ...style,
        }}
        cover={
          article.cover ? (
            <div className="relative h-48 overflow-hidden">
              <img
                alt={article.title}
                src={article.cover}
                className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-4 left-4">
                <Tag 
                  color="pink" 
                  className="!border-none"
                  style={{ 
                    background: 'rgba(22, 119, 255, 0.9)',
                    backdropFilter: 'blur(4px)',
                  }}
                >
                  <FolderOutlined className="mr-1" />
                  {article.category?.name || '未分类'}
                </Tag>
              </div>
            </div>
          ) : (
            <div 
              className="h-48 flex items-center justify-center"
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
        <div className="space-y-3">
          {/* 标题 */}
          <Title 
            level={4} 
            ellipsis={{ rows: 2 }}
            className="!mb-0 hover:text-primary transition-colors"
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
            className="!mb-0 text-gray-500"
            style={{
              textShadow: '0 1px 2px rgba(0, 0, 0, 0.08)',
            }}
          >
            {article.summary || '暂无摘要'}
          </Paragraph>

          {/* 标签 */}
          <div className="flex flex-wrap gap-1">
            {article.tags?.slice(0, 3).map(tag => (
              <Tag 
                key={tag._id} 
                className="!border-gray-200 !bg-gray-50 !text-gray-600"
              >
                {tag.name}
              </Tag>
            ))}
            {article.tags?.length > 3 && (
              <Tag className="!border-gray-200 !bg-gray-50 !text-gray-400">
                +{article.tags.length - 3}
              </Tag>
            )}
          </div>

          {/* 底部信息 */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <Space size={4}>
              <Avatar 
                size={24} 
                icon={<UserOutlined />}
                src={article.author?.avatar}
                style={{ background: currentColorTheme.primary }} // 主题色
              />
              <Text className="text-gray-500 text-sm">
                {article.author?.username || '匿名'}
              </Text>
            </Space>
            <Space 
              className="text-gray-400 text-sm" 
              split={<span className="mx-1">·</span>}
              style={{
                textShadow: '0 1px 2px rgba(0, 0, 0, 0.08)',
              }}
            >
              <span>
                <EyeOutlined className="mr-1" />
                {article.views || 0}
              </span>
              <span>
                <ClockCircleOutlined className="mr-1" />
                {dayjs(article.createdAt).format('MM-DD')}
              </span>
            </Space>
          </div>
        </div>
      </Card>
    </Link>
  );
};

export default ArticleCard;
