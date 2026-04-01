import React, { useEffect, useState } from 'react';
import { history, request, useModel } from 'umi';
import { Typography, Pagination, Space, Button } from 'antd';
import { HeartOutlined, ReadOutlined } from '@ant-design/icons';
import ArticleCard from '@/components/ArticleCard';
import Loading from '@/components/Loading';
import Empty from '@/components/Empty';
import useSEO from '@/hooks/useSEO';

const { Title, Text } = Typography;

const FavoritesPage: React.FC = () => {
  const { isLoggedIn, setLoginModalVisible } = useModel('githubUserModel');
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
      <div className="py-16 px-4 max-w-lg mx-auto text-center">
        <Title level={4}>请先登录</Title>
        <p className="text-gray-500 mb-6">登录 GitHub 后即可查看与管理收藏</p>
        <Button type="primary" size="large" onClick={() => setLoginModalVisible(true)}>
          去登录
        </Button>
      </div>
    );
  }

  if (loading && articles.length === 0) {
    return <Loading />;
  }

  return (
    <div className="animate-fade-in py-8 md:py-12 px-4 md:px-6 max-w-6xl mx-auto">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <div>
          <Title level={2} className="!mb-2 flex items-center gap-2">
            <HeartOutlined style={{ color: '#ff4d4f' }} />
            我的收藏
          </Title>
          <Text type="secondary">登录后收藏的文章会显示在这里</Text>
        </div>
        <Space>
          <Button icon={<ReadOutlined />} onClick={() => history.push('/articles')}>
            去逛逛文章
          </Button>
        </Space>
      </div>

      {articles.length === 0 ? (
        <Empty
          description="还没有收藏任何文章"
          showAction
          actionText="浏览文章"
          actionLink="/articles"
        />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {articles.map((article) => (
              <ArticleCard key={article._id} article={article} />
            ))}
          </div>
          {total > pageSize && (
            <div className="flex justify-center mt-10">
              <Pagination
                current={page}
                total={total}
                pageSize={pageSize}
                showSizeChanger={false}
                onChange={setPage}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default FavoritesPage;
