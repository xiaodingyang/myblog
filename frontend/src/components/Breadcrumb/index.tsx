import React from 'react';
import { Breadcrumb } from 'antd';
import { Link, useLocation } from 'umi';
import { HomeOutlined } from '@ant-design/icons';

const BreadcrumbNav: React.FC<{ articleTitle?: string; categoryName?: string; categorySlug?: string; tagName?: string; tagSlug?: string }> = ({
  articleTitle,
  categoryName,
  categorySlug,
  tagName,
  tagSlug,
}) => {
  const location = useLocation();
  const path = location.pathname;

  // Determine breadcrumb items based on path
  const items = [
    { title: <Link to="/"><HomeOutlined /> 首页</Link> },
  ];

  if (path.startsWith('/article/')) {
    items.push({ title: <Link to="/articles">文章列表</Link> });
    if (categoryName && categorySlug) {
      items.push({ title: <Link to={`/category/${categorySlug}`}>{categoryName}</Link> });
    }
    if (articleTitle) {
      items.push({ title: <span className="text-gray-500">{articleTitle}</span> });
    }
  } else if (path.startsWith('/category/')) {
    items.push({ title: <Link to="/categories">分类</Link> });
    if (categoryName) {
      items.push({ title: <span className="text-gray-500">{categoryName}</span> });
    }
  } else if (path.startsWith('/tag/')) {
    items.push({ title: <Link to="/tags">标签</Link> });
    if (tagName) {
      items.push({ title: <span className="text-gray-500">{tagName}</span> });
    }
  } else if (path === '/articles') {
    items.push({ title: <span className="text-gray-500">文章列表</span> });
  } else if (path === '/categories') {
    items.push({ title: <span className="text-gray-500">分类</span> });
  } else if (path === '/tags') {
    items.push({ title: <span className="text-gray-500">标签</span> });
  }

  return (
    <div className="mb-4">
      <Breadcrumb items={items} />
    </div>
  );
};

export default BreadcrumbNav;
