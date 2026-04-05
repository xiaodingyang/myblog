import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams, Link } from 'umi';
import { Typography, Row, Col, Input, Select, Space, Pagination, Tag, Card } from 'antd';
import { SearchOutlined, FilterOutlined, FolderOutlined, TagsOutlined, SortAscendingOutlined } from '@ant-design/icons';
import { request } from 'umi';
import { cachedRequest } from '@/utils/apiCache';
import ArticleCard from '@/components/ArticleCard';
import Empty from '@/components/Empty';
import ArticlesListSkeleton from '@/components/Skeleton/ArticlesListSkeleton';

import useSEO from '@/hooks/useSEO';

const { Title, Text } = Typography;
const { Option } = Select;

const ArticlesPage: React.FC = () => {
  useSEO({
    title: '文章列表',
    description: '若风的技术博客文章列表，涵盖前端开发、后端技术、开源项目等内容。',
    keywords: '技术文章,前端开发,React,TypeScript,Node.js',
  });
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [articles, setArticles] = useState<API.Article[]>([]);
  const [total, setTotal] = useState(0);
  const [categories, setCategories] = useState<API.Category[]>([]);
  const [tags, setTags] = useState<API.Tag[]>([]);

  // 查询参数
  const page = Number(searchParams.get('page')) || 1;
  const pageSize = 9;
  const keyword = searchParams.get('keyword') || '';
  const categoryId = searchParams.get('category') || '';
  const tagId = searchParams.get('tag') || '';
  const sort = searchParams.get('sort') || 'latest';

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [articlesRes, categoriesRes, tagsRes] = await Promise.all([
          request<API.Response<API.PageResult<API.Article>>>('/api/articles', {
            params: {
              page,
              pageSize,
              keyword: keyword || undefined,
              category: categoryId || undefined,
              tag: tagId || undefined,
              sort,
            },
          }),
          cachedRequest<API.Response<API.Category[]>>('/api/categories', {}, 30 * 60 * 1000),
          cachedRequest<API.Response<API.Tag[]>>('/api/tags', {}, 30 * 60 * 1000),
        ]);

        if (articlesRes.code === 0) {
          setArticles(articlesRes.data.list);
          setTotal(articlesRes.data.total);
        }
        if (categoriesRes.code === 0) setCategories(categoriesRes.data);
        if (tagsRes.code === 0) setTags(tagsRes.data);
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [page, keyword, categoryId, tagId, sort]);

  const updateParams = useCallback((key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    newParams.set('page', '1'); // 重置页码
    setSearchParams(newParams);
  }, [searchParams, setSearchParams]);

  const clearFilters = useCallback(() => {
    setSearchParams({});
  }, [setSearchParams]);

  const handlePageChange = useCallback((p: number) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', String(p));
    setSearchParams(newParams);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [searchParams, setSearchParams]);

  return (
    <div className="animate-fade-in py-6 md:py-8">
      <div className="max-w-6xl mx-auto px-4 md:px-6">
        {/* 页面标题 - 透明背景，显示粒子 */}
        <div className="text-center mb-8 md:mb-12">
          <Title 
            level={1} 
            className="!mb-2 md:!mb-3 !text-white !text-2xl md:!text-4xl"
            style={{
              textShadow: '0 2px 24px rgba(0, 0, 0, 0.45)',
            }}
          >
            文章列表
          </Title>
          <Text 
            className="!text-white/85 text-sm md:text-lg"
            style={{
              textShadow: '0 1px 12px rgba(0, 0, 0, 0.35)',
            }}
          >
            共 {total} 篇文章，记录技术成长的点滴
          </Text>
        </div>

        {/* 内容区域 - 白色背景，覆盖粒子 */}
        <div 
          className="bg-white/95 backdrop-blur-sm rounded-2xl p-4 md:p-6 shadow-lg relative z-10"
          style={{ minHeight: 400 }}
        >
          {/* 搜索和筛选 */}
          <Card
            className="mb-8"
            style={{
              borderRadius: 16,
              border: '1px solid #f0f0f0',
              boxShadow: 'none',
            }}
          >
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} md={8}>
              <Input
                placeholder="搜索文章标题..."
                prefix={<SearchOutlined className="text-gray-400" />}
                value={keyword}
                onChange={(e) => updateParams('keyword', e.target.value)}
                onPressEnter={(e) => updateParams('keyword', (e.target as HTMLInputElement).value)}
                allowClear
                size="large"
                className="!rounded-lg"
              />
            </Col>
            <Col xs={12} md={6}>
              <Select
                placeholder="选择分类"
                value={categoryId || undefined}
                onChange={(value) => updateParams('category', value || '')}
                allowClear
                size="large"
                className="w-full"
                suffixIcon={<FolderOutlined />}
              >
                {categories.map(cat => (
                  <Option key={cat._id} value={cat._id}>
                    {cat.name}
                  </Option>
                ))}
              </Select>
            </Col>
            <Col xs={12} md={6}>
              <Select
                placeholder="选择标签"
                value={tagId || undefined}
                onChange={(value) => updateParams('tag', value || '')}
                allowClear
                size="large"
                className="w-full"
                suffixIcon={<TagsOutlined />}
              >
                {tags.map(tag => (
                  <Option key={tag._id} value={tag._id}>
                    {tag.name}
                  </Option>
                ))}
              </Select>
            </Col>
            <Col xs={12} md={4}>
              <Select
                value={sort}
                onChange={(value) => updateParams('sort', value)}
                size="large"
                className="w-full"
                suffixIcon={<SortAscendingOutlined />}
              >
                <Option value="latest">最新优先</Option>
                <Option value="oldest">最旧优先</Option>
                <Option value="hottest">热门优先</Option>
              </Select>
            </Col>
            <Col xs={24} md={4}>
              {(keyword || categoryId || tagId) && (
                <a onClick={clearFilters} className="text-primary cursor-pointer">
                  <FilterOutlined className="mr-1" />
                  清除筛选
                </a>
              )}
            </Col>
          </Row>

          {/* 当前筛选条件 */}
          {(keyword || categoryId || tagId) && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <Space wrap>
                <Text className="text-gray-500">当前筛选：</Text>
                {keyword && (
                  <Tag 
                    closable 
                    onClose={() => updateParams('keyword', '')}
                    color="pink"
                  >
                    关键词：{keyword}
                  </Tag>
                )}
                {categoryId && (
                  <Tag 
                    closable 
                    onClose={() => updateParams('category', '')}
                    color="green"
                  >
                    分类：{categories.find(c => c._id === categoryId)?.name}
                  </Tag>
                )}
                {tagId && (
                  <Tag 
                    closable 
                    onClose={() => updateParams('tag', '')}
                    color="pink"
                  >
                    标签：{tags.find(t => t._id === tagId)?.name}
                  </Tag>
                )}
              </Space>
            </div>
          )}
        </Card>

        {/* 文章列表 */}
        {loading ? (
          <ArticlesListSkeleton />
        ) : articles.length > 0 ? (
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

            {/* 分页 */}
            {total > pageSize && (
              <div className="flex justify-center mt-8 md:mt-12">
                <Pagination
                  current={page}
                  total={total}
                  pageSize={pageSize}
                  showSizeChanger={false}
                  // Bug Fix #9: 移除 hidden md:inline，移动端用户也应能看到文章总数信息
                  showTotal={(total, range) => (
                    <span>共 {total} 篇文章</span>
                  )}
                  size="default"
                  responsive
                  onChange={handlePageChange}
                />
              </div>
            )}
          </>
        ) : (
          <Empty 
            description="暂无文章" 
            showAction 
            actionText="返回首页"
            actionLink="/"
          />
        )}
        </div>
      </div>
    </div>
  );
};

export default ArticlesPage;
