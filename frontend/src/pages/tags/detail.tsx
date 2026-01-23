import React, { useEffect, useState } from 'react';
import { useParams, history } from 'umi';
import { useModel } from 'umi';
import { getColorThemeById } from '@/config/colorThemes';
import { Typography, Row, Col, Button, Pagination, Tag } from 'antd';
import { ArrowLeftOutlined, TagOutlined } from '@ant-design/icons';
import { request } from 'umi';
import ArticleCard from '@/components/ArticleCard';
import Loading from '@/components/Loading';
import Empty from '@/components/Empty';

const { Title, Text } = Typography;

const TagDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const { themeId: colorThemeId } = useModel('colorModel');
  const currentColorTheme = getColorThemeById(colorThemeId);
  const [tag, setTag] = useState<API.Tag | null>(null);
  const [articles, setArticles] = useState<API.Article[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const pageSize = 9;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [tagRes, articlesRes] = await Promise.all([
          request<API.Response<API.Tag>>(`/api/tags/${id}`),
          request<API.Response<API.PageResult<API.Article>>>('/api/articles', {
            params: { page, pageSize, tag: id },
          }),
        ]);

        if (tagRes.code === 0) setTag(tagRes.data);
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

  if (!tag) {
    return (
      <div className="py-16">
        <Empty 
          description="标签不存在" 
          showAction 
          actionText="返回标签列表"
          actionLink="/tags"
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
              <TagOutlined className="text-3xl text-white" />
            </div>
            <div>
              <Title level={1} className="!mb-1 flex items-center gap-3">
                <Tag color="pink" className="!text-lg !px-3 !py-1">
                  # {tag.name}
                </Tag>
              </Title>
              <Text className="text-gray-500">
                共 {total} 篇文章
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
          <Empty description="该标签下暂无文章" />
        )}
      </div>
    </div>
  );
};

export default TagDetailPage;
