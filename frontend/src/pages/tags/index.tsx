import React, { useEffect, useState } from 'react';
import { Link } from 'umi';
import { useModel } from 'umi';
import { getColorThemeById } from '@/config/colorThemes';
import { Typography, Card, Tag } from 'antd';
import { TagsOutlined } from '@ant-design/icons';
import { request } from 'umi';
import Empty from '@/components/Empty';
import useSEO from '@/hooks/useSEO';

const { Title, Text } = Typography;

const TagsPage: React.FC = () => {
  useSEO({
    title: '标签',
    description: '按标签浏览若风技术博客的所有文章，精确定位感兴趣的技术话题。',
    keywords: '文章标签,技术标签,前端开发,React,TypeScript',
  });
  const [loading, setLoading] = useState(true);
  const [tags, setTags] = useState<API.Tag[]>([]);

  useEffect(() => {
    const fetchTags = async () => {
      setLoading(true);
      try {
        const res = await request<API.Response<API.Tag[]>>('/api/tags');
        if (res.code === 0) {
          setTags(res.data);
        }
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };

    fetchTags();
  }, []);

  // 根据文章数量计算标签大小
  const getTagSize = (count: number) => {
    const max = Math.max(...tags.map(t => t.articleCount || 0));
    const ratio = max > 0 ? (count / max) : 0;
    return 14 + ratio * 10; // 14px - 24px
  };

  const { themeId: colorThemeId } = useModel('colorModel');
  const currentColorTheme = getColorThemeById(colorThemeId);
  
  // 生成随机颜色（基于主题色）
  const getTagColor = (index: number) => {
    // 使用主题色生成不同透明度的变体
    const opacities = [1.0, 0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2, 0.1];
    const opacity = opacities[index % opacities.length];
    // 将主题色转换为 rgba
    const hex = currentColorTheme.primary.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };

  // 骨架屏
  const TagsSkeleton = () => (
    <div className="p-6 rounded-2xl border border-gray-100" style={{ boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
      <div className="flex flex-wrap justify-center gap-4 py-8">
        {[80, 60, 100, 50, 70, 90, 55, 85, 65, 75, 45, 95].map((w, i) => (
          <div
            key={i}
            className="h-10 rounded-full bg-gray-200 animate-pulse"
            style={{ width: w, animationDelay: `${i * 0.05}s` }}
          />
        ))}
      </div>
    </div>
  );

  return (
    <div className="animate-fade-in py-8">
      <div className="max-w-4xl mx-auto px-6">
        {/* 页面标题 - 透明背景，显示粒子 */}
        <div className="text-center mb-12">
          <div
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
            style={{
              background: currentColorTheme.gradient, // 主题色渐变
            }}
          >
            <TagsOutlined className="text-3xl text-white" />
          </div>
          <Title 
            level={1} 
            className="!mb-3 !text-white"
            style={{
              textShadow: '0 2px 24px rgba(0, 0, 0, 0.45)',
            }}
          >
            标签云
          </Title>
          <Text 
            className="!text-white/85 text-lg"
            style={{
              textShadow: '0 1px 12px rgba(0, 0, 0, 0.35)',
            }}
          >
            共 {tags.length} 个标签
          </Text>
        </div>

        {/* 内容区域 - 白色背景，覆盖粒子 */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-lg relative z-10" style={{ minHeight: 300 }}>
        {/* 标签云 */}
        {loading ? (
          <TagsSkeleton />
        ) : tags.length > 0 ? (
          <Card
            style={{
              borderRadius: 16,
              border: 'none',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
            }}
          >
            <div className="flex flex-wrap justify-center gap-4 py-8">
              {tags.map((tag, index) => (
                <Link key={tag._id} to={`/tag/${tag._id}`}>
                  <Tag
                    className="!m-0 !px-4 !py-2 cursor-pointer hover:opacity-80 transition-all hover:scale-105"
                    style={{
                      fontSize: getTagSize(tag.articleCount || 0),
                      color: getTagColor(index),
                      background: `${getTagColor(index)}10`,
                      border: `1px solid ${getTagColor(index)}30`,
                      borderRadius: 20,
                    }}
                  >
                    {tag.name}
                    <span
                      className="ml-2 text-xs opacity-60"
                      style={{ fontSize: 12 }}
                    >
                      {tag.articleCount || 0}
                    </span>
                  </Tag>
                </Link>
              ))}
            </div>
          </Card>
        ) : (
          <Empty description="暂无标签" />
        )}
        </div>
      </div>
    </div>
  );
};

export default TagsPage;
