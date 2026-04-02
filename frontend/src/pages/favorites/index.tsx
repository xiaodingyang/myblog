import React, { useEffect, useState } from 'react';
import { history, request, useModel } from 'umi';
import { Typography, Pagination, Space, Button, Row, Col, Card } from 'antd';
import { HeartOutlined, HeartFilled, ReadOutlined } from '@ant-design/icons';
import { getColorThemeById } from '@/config/colorThemes';
import ArticleCard from '@/components/ArticleCard';
import Empty from '@/components/Empty';
import useSEO from '@/hooks/useSEO';

const { Title, Text } = Typography;

// 骨架屏
const FavoritesSkeleton: React.FC = () => (
  <Row gutter={[24, 24]}>
    {[1, 2, 3, 4, 5, 6].map((i) => (
      <Col xs={24} sm={12} lg={8} key={i}>
        <div className="rounded-2xl overflow-hidden border border-gray-100" style={{ boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
          <div className="h-48 bg-gray-200 animate-pulse" />
          <div className="p-4 space-y-3">
            <div className="h-5 w-3/4 rounded bg-gray-200 animate-pulse" />
            <div className="h-4 w-full rounded bg-gray-100 animate-pulse" />
            <div className="h-4 w-2/3 rounded bg-gray-100 animate-pulse" />
            <div className="pt-3 border-t border-gray-100 flex justify-between">
              <div className="h-4 w-20 rounded bg-gray-100 animate-pulse" />
              <div className="h-4 w-16 rounded bg-gray-100 animate-pulse" />
            </div>
          </div>
        </div>
      </Col>
    ))}
  </Row>
);

const FavoritesPage: React.FC = () => {
  const { isLoggedIn, setLoginModalVisible } = useModel('githubUserModel');
  const { themeId: colorThemeId } = useModel('colorModel');
  const currentColorTheme = getColorThemeById(colorThemeId);

  useSEO({
    title: '我的收藏',
    description: '你在若风博客中收藏的文章列表。',
    keywords: '收藏,博客,文章',
  });
  const [loading, setLoading] = useState(true);
  const [articles, setArticles] = useState<API.Article[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const pageSize = 9;

  useEffect(() => {
    if (!isLoggedIn) {
      setLoading(false);
      setArticles([]);
      setTotal(0);
      return;
    }
    const run = async () => {
      setLoading(true);
      try {
        const res = await request<API.Response<API.PageResult<API.Article>>>('/api/favorites', {
          params: { page, pageSize },
        });
        if (res.code === 0) {
          setArticles(res.data.list);
          setTotal(res.data.total);
        }
      } catch {
        // 由全局错误或接口消息提示
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [page, isLoggedIn, pageSize]);

  if (!isLoggedIn) {
    return (
      <div className="animate-fade-in py-8">
        <div className="max-w-lg mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <div
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
              style={{ background: currentColorTheme.gradient }}
            >
              <HeartOutlined className="text-3xl text-white" />
            </div>
            <Title
              level={1}
              className="!mb-3 !text-white"
              style={{ textShadow: '0 2px 24px rgba(0, 0, 0, 0.45)' }}
            >
              我的收藏
            </Title>
          </div>
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 shadow-lg relative z-10 text-center">
            <Title level={4}>请先登录</Title>
            <p className="text-gray-500 mb-6">登录 GitHub 后即可查看与管理收藏</p>
            <Button
              type="primary"
              size="large"
              className="!rounded-full !px-8"
              style={{ background: currentColorTheme.gradient, border: 'none' }}
              onClick={() => setLoginModalVisible(true)}
            >
              去登录
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in py-8">
      <div className="max-w-6xl mx-auto px-4 md:px-6">
        {/* 页面标题 */}
        <div className="text-center mb-12">
          <div
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
            style={{ background: currentColorTheme.gradient }}
          >
            <HeartFilled className="text-3xl text-white" />
          </div>
          <Title
            level={1}
            className="!mb-3 !text-white"
            style={{ textShadow: '0 2px 24px rgba(0, 0, 0, 0.45)' }}
          >
            我的收藏
          </Title>
          <Text
            className="!text-white/85 text-lg"
            style={{ textShadow: '0 1px 12px rgba(0, 0, 0, 0.35)' }}
          >
            {total > 0 ? `共收藏了 ${total} 篇文章` : '收藏喜欢的文章，随时回顾'}
          </Text>
        </div>

        {/* 内容区域 */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-lg relative z-10" style={{ minHeight: 300 }}>
          <div className="flex justify-end mb-4">
            <Button
              icon={<ReadOutlined />}
              onClick={() => history.push('/articles')}
              className="!rounded-lg"
            >
              去逛逛文章
            </Button>
          </div>

          {loading ? (
            <FavoritesSkeleton />
          ) : articles.length === 0 ? (
            <Empty
              description="还没有收藏任何文章"
              showAction
              actionText="浏览文章"
              actionLink="/articles"
            />
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {articles.map((article, index) => (
                  <div
                    key={article._id}
                    className="animate-slide-up"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <ArticleCard article={article} />
                  </div>
                ))}
              </div>
              {total > pageSize && (
                <div className="flex justify-center mt-10">
                  <Pagination
                    current={page}
                    total={total}
                    pageSize={pageSize}
                    showSizeChanger={false}
                    showTotal={(total) => <span>共 {total} 篇收藏</span>}
                    onChange={(p) => {
                      setPage(p);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default FavoritesPage;
