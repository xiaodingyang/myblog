import React, { useMemo } from 'react';
import { Breadcrumb } from 'antd';
import { Link, useLocation } from 'umi';
import { HomeOutlined } from '@ant-design/icons';
import { Helmet } from 'react-helmet-async';
import { SITE_ORIGIN } from '@/hooks/useSEO';

interface BreadcrumbNavProps {
  articleTitle?: string;
  categoryName?: string;
  categorySlug?: string;
  tagName?: string;
  tagSlug?: string;
}

const BreadcrumbNav: React.FC<BreadcrumbNavProps> = ({
  articleTitle,
  categoryName,
  categorySlug,
  tagName,
  tagSlug,
}) => {
  const location = useLocation();
  const path = location.pathname;

  const items = [
    { title: <Link to="/"><HomeOutlined /> 首页</Link> },
  ];

  const jsonLdItems: { name: string; url: string }[] = [
    { name: '首页', url: `${SITE_ORIGIN}/` },
  ];

  if (path.startsWith('/article/')) {
    items.push({ title: <Link to="/articles">文章列表</Link> });
    jsonLdItems.push({ name: '文章', url: `${SITE_ORIGIN}/articles` });
    if (categoryName && categorySlug) {
      items.push({ title: <Link to={`/category/${categorySlug}`}>{categoryName}</Link> });
      jsonLdItems.push({ name: categoryName, url: `${SITE_ORIGIN}/category/${categorySlug}` });
    }
    if (articleTitle) {
      items.push({ title: <span className="text-gray-500">{articleTitle}</span> });
      jsonLdItems.push({ name: articleTitle, url: `${SITE_ORIGIN}${path}` });
    }
  } else if (path.startsWith('/category/')) {
    items.push({ title: <Link to="/categories">分类</Link> });
    jsonLdItems.push({ name: '分类', url: `${SITE_ORIGIN}/categories` });
    if (categoryName) {
      items.push({ title: <span className="text-gray-500">{categoryName}</span> });
      jsonLdItems.push({ name: categoryName, url: `${SITE_ORIGIN}${path}` });
    }
  } else if (path.startsWith('/tag/')) {
    items.push({ title: <Link to="/tags">标签</Link> });
    jsonLdItems.push({ name: '标签', url: `${SITE_ORIGIN}/tags` });
    if (tagName) {
      items.push({ title: <span className="text-gray-500">{tagName}</span> });
      jsonLdItems.push({ name: tagName, url: `${SITE_ORIGIN}${path}` });
    }
  } else if (path === '/articles') {
    items.push({ title: <span className="text-gray-500">文章列表</span> });
    jsonLdItems.push({ name: '文章', url: `${SITE_ORIGIN}/articles` });
  } else if (path === '/categories') {
    items.push({ title: <span className="text-gray-500">分类</span> });
    jsonLdItems.push({ name: '分类', url: `${SITE_ORIGIN}/categories` });
  } else if (path === '/tags') {
    items.push({ title: <span className="text-gray-500">标签</span> });
    jsonLdItems.push({ name: '标签', url: `${SITE_ORIGIN}/tags` });
  }

  const jsonLdString = useMemo(() => {
    if (jsonLdItems.length <= 1) return undefined;
    return JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: jsonLdItems.map((item, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: item.name,
        ...(i < jsonLdItems.length - 1 ? { item: item.url } : {}),
      })),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path, articleTitle, categoryName, tagName]);

  return (
    <div className="mb-4">
      {jsonLdString && (
        <Helmet>
          <script type="application/ld+json">{jsonLdString}</script>
        </Helmet>
      )}
      <Breadcrumb items={items} />
    </div>
  );
};

export default BreadcrumbNav;
