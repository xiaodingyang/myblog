import React, { useEffect, useState } from 'react';
import { Link } from 'umi';
import { useModel } from 'umi';
import { getColorThemeById } from '@/config/colorThemes';
import { Typography, Row, Col, Card, Tag } from 'antd';
import { FolderOutlined, FileTextOutlined } from '@ant-design/icons';
import { request } from 'umi';
import { cachedRequest } from '@/utils/apiCache';
import Empty from '@/components/Empty';
import useSEO from '@/hooks/useSEO';

const { Title, Text, Paragraph } = Typography;

const CategoriesPage: React.FC = () => {
  useSEO({
    title: '分类',
    description: '按分类浏览若风技术博客的所有文章，快速找到感兴趣的内容。',
    keywords: '文章分类,技术博客,前端,后端',
  });
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<API.Category[]>([]);
  const { themeId: colorThemeId } = useModel('colorModel');
  const currentColorTheme = getColorThemeById(colorThemeId);

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      try {
        const res = await cachedRequest<API.Response<API.Category[]>>('/api/categories', {}, 30 * 60 * 1000);
        if (res.code === 0) {
          setCategories(res.data);
        }
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // 骨架屏
  const CategoriesSkeleton = () => (
    <Row gutter={[24, 24]}>
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <Col xs={24} sm={12} lg={8} key={i}>
          <div className="p-5 rounded-2xl border border-gray-100" style={{ boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-xl bg-gray-200 animate-pulse flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-6 w-24 rounded bg-gray-200 animate-pulse" />
                <div className="h-4 w-full rounded bg-gray-100 animate-pulse" />
                <div className="h-5 w-16 rounded-full bg-gray-100 animate-pulse" />
              </div>
            </div>
          </div>
        </Col>
      ))}
    </Row>
  );

  return (
    <div className="animate-fade-in py-8">
      <div className="max-w-6xl mx-auto px-6">
        {/* 页面标题 - 透明背景，显示粒子 */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4" style={{
            background: currentColorTheme.gradient, // 主题色渐变
          }}>
            <FolderOutlined className="text-3xl text-white" />
          </div>
          <Title 
            level={1} 
            className="!mb-3 !text-white"
            style={{
              textShadow: '0 2px 24px rgba(0, 0, 0, 0.45)',
            }}
          >
            文章分类
          </Title>
          <Text 
            className="!text-white/85 text-lg"
            style={{
              textShadow: '0 1px 12px rgba(0, 0, 0, 0.35)',
            }}
          >
            共 {categories.length} 个分类
          </Text>
        </div>

        {/* 内容区域 - 白色背景，覆盖粒子 */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-lg relative z-10" style={{ minHeight: 300 }}>
        {/* 分类列表 */}
        {loading ? (
          <CategoriesSkeleton />
        ) : categories.length > 0 ? (
          <Row gutter={[24, 24]}>
            {categories.map((category, index) => (
              <Col xs={24} sm={12} lg={8} key={category._id}>
                <Link to={`/category/${category._id}`}>
                  <Card
                    hoverable
                    className="card-hover h-full"
                    style={{
                      borderRadius: 16,
                      border: 'none',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                      animationDelay: `${index * 0.1}s`,
                    }}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{
                          background: `linear-gradient(135deg, hsl(${(index * 40) % 360}, 70%, 50%) 0%, hsl(${(index * 40 + 20) % 360}, 70%, 60%) 100%)`,
                        }}
                      >
                        <FolderOutlined className="text-2xl text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <Title 
                          level={4} 
                          className="!mb-2"
                          style={{
                            textShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                          }}
                        >
                          {category.name}
                        </Title>
                        <Paragraph
                          ellipsis={{ rows: 2 }}
                          className="!mb-3 text-gray-500"
                          style={{
                            textShadow: '0 1px 2px rgba(0, 0, 0, 0.08)',
                          }}
                        >
                          {category.description || '暂无描述'}
                        </Paragraph>
                        <Tag icon={<FileTextOutlined />} color="pink">
                          {category.articleCount || 0} 篇文章
                        </Tag>
                      </div>
                    </div>
                  </Card>
                </Link>
              </Col>
            ))}
          </Row>
        ) : (
          <Empty description="暂无分类" />
        )}
        </div>
      </div>
    </div>
  );
};

export default CategoriesPage;
