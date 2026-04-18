import React, { useMemo, useEffect } from 'react';
import { Link } from 'umi';
import { useModel } from 'umi';
import { getColorThemeById } from '@/config/colorThemes';
import { Typography, Row, Col, Tag, Divider } from 'antd';
import { FolderOutlined, FileTextOutlined, TagsOutlined } from '@ant-design/icons';
import Empty from '@/components/shared/Empty';
import useSEO, { SITE_ORIGIN } from '@/hooks/useSEO';
import { useCategories, useTags } from '@/hooks/useQueries';
import { themeBg } from '@/utils/themeHelpers';
import ScrollReveal from '@/components/visual/ScrollReveal';

const { Title, Text, Paragraph } = Typography;

const CategoriesPage: React.FC = () => {
  const seo = useSEO({
    title: '分类',
    description: '按分类浏览若风技术博客的所有文章，快速找到感兴趣的内容。',
    keywords: '文章分类,技术博客,前端,后端',
    ogUrl: `${SITE_ORIGIN}/categories`,
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: '文章分类 - 若风的博客',
      url: 'https://www.xiaodingyang.art/categories',
      description: '按分类浏览若风技术博客的所有文章',
      breadcrumb: {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: '首页', item: 'https://www.xiaodingyang.art/' },
          { '@type': 'ListItem', position: 2, name: '分类', item: 'https://www.xiaodingyang.art/categories' },
        ],
      },
    },
  });
  const { data: categories = [], isLoading: loading } = useCategories();
  const { data: tags = [], isLoading: tagsLoading } = useTags();
  const { themeId: colorThemeId } = useModel('colorModel');
  const currentColorTheme = getColorThemeById(colorThemeId);

  /** 仅展示有关联文章的标签（避免空白占位与无意义入口） */
  const hotTags = useMemo(
    () =>
      [...tags]
        .filter((t) => (t.articleCount || 0) > 0)
        .sort((a, b) => (b.articleCount || 0) - (a.articleCount || 0)),
    [tags],
  );

  useEffect(() => {
    if (typeof window === 'undefined' || window.location.hash !== '#article-tags') return;
    const el = document.getElementById('article-tags');
    if (el) requestAnimationFrame(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  }, [loading, tagsLoading, hotTags.length]);

  // 骨架屏
  const CategoriesSkeleton = () => (
    <Row gutter={[24, 24]}>
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <Col xs={24} sm={12} lg={8} key={i}>
          <div className="p-5 rounded-card-lg border border-white/10" style={{ boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-card-lg bg-white/10 animate-pulse flex-shrink-0" />
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
      {seo}
      <div className="max-w-6xl mx-auto px-6">
        {/* 页面标题 - 透明背景，显示粒子 */}
        <ScrollReveal direction="up">
        <div className="text-center mb-10 md:mb-14">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-card-lg mb-4" style={{
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
        <div className="rounded-card-lg p-5 md:p-8 relative z-10" style={{ minHeight: 300, background: themeBg(currentColorTheme.primary, 0.12), backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: `1px solid ${themeBg(currentColorTheme.primary, 0.18)}`, boxShadow: '0 8px 32px rgba(0,0,0,0.15)' }}>
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
                    className="card-hover h-full rounded-card-lg cursor-pointer"
                    style={{
                      background: themeBg(currentColorTheme.primary, 0.10),
                      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.15)',
                      animationDelay: `${index * 0.1}s`,
                    }}
                  >
                    <div className="flex items-start gap-4 p-6">
                      <div
                        className="w-14 h-14 rounded-card-lg flex items-center justify-center flex-shrink-0"
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
                          ellipsis={{ rows: 1 }}
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

        {!tagsLoading && hotTags.length > 0 && (
          <section id="article-tags" className="scroll-mt-24">
            <Divider
              className="!mt-10 !mb-6"
              style={{ borderColor: themeBg(currentColorTheme.primary, 0.2) }}
            >
              <span className="text-white/50 text-xs px-2">技术标签</span>
            </Divider>
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <div className="flex items-center gap-2 text-white/90 text-sm font-medium">
                <TagsOutlined style={{ color: currentColorTheme.primary }} />
                按标签浏览（仅显示有文章的标签）
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {hotTags.map((t) => (
                <Link key={t._id} to={`/tag/${t._id}`}>
                  <span
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-colors border"
                    style={{
                      background: 'rgba(255, 255, 255, 0.08)',
                      color: 'rgba(248, 250, 252, 0.95)',
                      borderColor: 'rgba(255, 255, 255, 0.14)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = `${currentColorTheme.primary}28`;
                      e.currentTarget.style.color = '#ffffff';
                      e.currentTarget.style.borderColor = `${currentColorTheme.primary}55`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                      e.currentTarget.style.color = 'rgba(248, 250, 252, 0.95)';
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.14)';
                    }}
                  >
                    {t.name}
                    <span style={{ opacity: 0.5 }}>({t.articleCount || 0})</span>
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}
        </div>
      </div>
    </div>
  );
};

export default CategoriesPage;
