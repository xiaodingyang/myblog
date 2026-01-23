import React, { useEffect, useState } from 'react';
import { useParams, history } from 'umi';
import { useModel } from 'umi';
import { getColorThemeById } from '@/config/colorThemes';
import { Typography, Row, Col, Button, Pagination } from 'antd';
import { ArrowLeftOutlined, FolderOutlined } from '@ant-design/icons';
import { request } from 'umi';
import ArticleCard from '@/components/ArticleCard';
import Loading from '@/components/Loading';
import Empty from '@/components/Empty';

const { Title, Text } = Typography;

const CategoryDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const { themeId: colorThemeId } = useModel('colorModel');
  const currentColorTheme = getColorThemeById(colorThemeId);
  const [category, setCategory] = useState<API.Category | null>(null);
  const [articles, setArticles] = useState<API.Article[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const pageSize = 9;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [categoryRes, articlesRes] = await Promise.all([
          request<API.Response<API.Category>>(`/api/categories/${id}`),
          request<API.Response<API.PageResult<API.Article>>>('/api/articles', {
            params: { page, pageSize, category: id },
          }),
        ]);

        if (categoryRes.code === 0) setCategory(categoryRes.data);
        if (articlesRes.code === 0) {
          setArticles(articlesRes.data.list);
          setTotal(articlesRes.data.total);
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchData();
  }, [id, page]);

  if (loading) {
    return <Loading />;
  }

  if (!category) {
    return (
      <div className="py-16">
        <Empty 
          description="分类不存在" 
          showAction 
          actionText="返回分类列表"
          actionLink="/categories"
        />
      </div>
    );
  }

  return (
    <div className="animate-fade-in py-8">
      <div className="max-w-6xl mx-auto px-6">
        {/* 页面标题 */}
        <div className="mb-8">
          <Button
            type="link"
            icon={<ArrowLeftOutlined />}
            onClick={() => history.back()}
            className="!pl-0 mb-4"
          >
            返回
          </Button>
          <div className="flex items-center gap-4">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{
                background: currentColorTheme.gradient, // 主题色渐变
              }}
            >
              <FolderOutlined className="text-3xl text-white" />
            </div>
            <div>
              <Title level={1} className="!mb-1">
                {category.name}
              </Title>
              <Text className="text-gray-500">
                {category.description || '暂无描述'} · 共 {total} 篇文章
              </Text>
            </div>
          </div>
        </div>

        {/* 文章列表 */}
        {articles.length > 0 ? (
          <>
            <Row gutter={[24, 24]}>
              {articles.map((article, index) => (
                <Col xs={24} sm={12} lg={8} key={article._id}>
                  <div
                    className="animate-slide-up"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <ArticleCard article={article} />
                  </div>
                </Col>
              ))}
            </Row>

            {total > pageSize && (
              <div className="flex justify-center mt-12">
                <Pagination
                  current={page}
                  total={total}
                  pageSize={pageSize}
                  showSizeChanger={false}
                  onChange={(p) => {
                    setPage(p);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                />
              </div>
            )}
          </>
        ) : (
          <Empty description="该分类下暂无文章" />
        )}
      </div>
    </div>
  );
};

export default CategoryDetailPage;
