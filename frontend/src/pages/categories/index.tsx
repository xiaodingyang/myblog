import React from 'react';
import { Link } from 'umi';
import { useModel } from 'umi';
import { getColorThemeById } from '@/config/colorThemes';
import { Typography, Row, Col, Tag } from 'antd';
import { FolderOutlined, FileTextOutlined } from '@ant-design/icons';
import Empty from '@/components/shared/Empty';
import useSEO from '@/hooks/useSEO';
import { useCategories } from '@/hooks/useQueries';
import { themeBg } from '@/utils/themeHelpers';
import ScrollReveal from '@/components/visual/ScrollReveal';

const { Title, Text, Paragraph } = Typography;

const CategoriesPage: React.FC = () => {
  useSEO({
    title: '分类',
    description: '按分类浏览若风技术博客的所有文章，快速找到感兴趣的内容。',
    keywords: '文章分类,技术博客,前端,后端',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: '文章分类 - 若风的博客',
      url: 'https://www.xiaodingyang.art/categories',
      description: '按分类浏览若风技术博客的所有文章',
    },
  });
  const { data: categories = [], isLoading: loading } = useCategories();
  const { themeId: colorThemeId } = useModel('colorModel');
  const currentColorTheme = getColorThemeById(colorThemeId);

  // 骨架屏
  const CategoriesSkeleton = () => (
    <Row gutter={[24, 24]}>
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <Col xs={24} sm={12} lg={8} key={i}>
          <div className="p-5 rounded-2xl border border-white/10" style={{ boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-xl bg-white/10 animate-pulse flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-6 w-24 rounded bg-white/10 animate-pulse" />
                <div className="h-4 w-full rounded bg-white/6 animate-pulse" />
                <div className="h-5 w-16 rounded-full bg-white/6 animate-pulse" />
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
        <ScrollReveal direction="up">
        <div className="text-center mb-10 md:mb-14">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4" style={{
            background: currentColorTheme.gradient,
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
        </ScrollReveal>

        {/* 内容区域 - 深色毛玻璃 */}
        <div className="rounded-2xl p-5 md:p-8 relative z-10" style={{ minHeight: 300, background: themeBg(currentColorTheme.primary, 0.12), backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: `1px solid ${themeBg(currentColorTheme.primary, 0.18)}`, boxShadow: '0 8px 32px rgba(0,0,0,0.15)' }}>
        {/* 分类列表 */}
        {loading ? (
          <CategoriesSkeleton />
        ) : categories.length > 0 ? (
          <Row gutter={[24, 24]}>
            {categories.map((category, index) => (
              <Col xs={24} sm={12} lg={8} key={category._id}>
                <ScrollReveal direction="up" delay={index * 0.08}>
                <Link to={`/category/${category._id}`}>
                  <div
                    className="card-hover h-full rounded-2xl cursor-pointer"
                    style={{
                      background: themeBg(currentColorTheme.primary, 0.10),
                      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.15)',
                      animationDelay: `${index * 0.1}s`,
                    }}
                  >
                    <div className="flex items-start gap-4 p-6">
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
                          className="!mb-3 !text-white/90"
                          style={{
                            textShadow: '0 1px 6px rgba(0, 0, 0, 0.3)',
                          }}
                        >
                          {category.name}
                        </Title>
                        <Paragraph
                          ellipsis={{ rows: 2 }}
                          className="!mb-4 !text-white/65"
                          style={{
                            textShadow: '0 1px 4px rgba(0, 0, 0, 0.2)',
                          }}
                        >
                          {category.description || '暂无描述'}
                        </Paragraph>
                        <Tag icon={<FileTextOutlined />} style={{ background: themeBg(currentColorTheme.primary, 0.15), color: currentColorTheme.primary, border: 'none' }}>
                          {category.articleCount || 0} 篇文章
                        </Tag>
                      </div>
                    </div>
                  </div>
                </Link>
                </ScrollReveal>
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
