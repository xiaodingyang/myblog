import React from 'react';
import { Card, Skeleton, Typography, Space, Divider } from 'antd';
import { EyeOutlined, ClockCircleOutlined } from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

const ArticleDetailSkeleton: React.FC = () => {
  return (
    <div className="animate-fade-in">
      {/* Hero section skeleton */}
      <section
        className="relative py-16 md:py-24 overflow-hidden"
        style={{
          background: 'linear-gradient(rgba(15, 23, 42, 0.8), rgba(15, 23, 42, 0.9))',
        }}
      >
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <div className="h-10 w-32 rounded-full bg-gray-700 animate-pulse mb-6" />
          <div className="h-12 w-4/5 rounded-lg bg-gray-700 animate-pulse mb-4" />
          <div className="h-6 w-1/3 rounded bg-gray-700 animate-pulse mb-6" />
          <Space className="mb-6">
            <div className="w-10 h-10 rounded-full bg-gray-700 animate-pulse" />
            <div className="h-5 w-32 rounded bg-gray-700 animate-pulse" />
            <div className="h-5 w-24 rounded bg-gray-700 animate-pulse" />
            <div className="h-5 w-24 rounded bg-gray-700 animate-pulse" />
          </Space>
          <div className="flex gap-2">
            <div className="h-8 w-20 rounded-full bg-gray-700 animate-pulse" />
            <div className="h-8 w-20 rounded-full bg-gray-700 animate-pulse" />
          </div>
        </div>
      </section>

      {/* Content skeleton */}
      <section className="py-8 md:py-12">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 lg:items-start">
            <Card
              className="flex-1 min-w-0 w-full"
              style={{
                borderRadius: 16,
                border: 'none',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
              }}
            >
              {/* Article content skeleton */}
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="space-y-2">
                    <div className="h-5 w-1/4 rounded bg-gray-200 animate-pulse" />
                    <div className="h-4 w-full rounded bg-gray-100 animate-pulse" />
                    <div className="h-4 w-5/6 rounded bg-gray-100 animate-pulse" />
                    <div className="h-4 w-3/4 rounded bg-gray-100 animate-pulse" />
                  </div>
                ))}
              </div>

              <Divider />

              {/* Action buttons skeleton */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="h-10 w-32 rounded-lg bg-gray-200 animate-pulse" />
                <div className="h-10 w-24 rounded-lg bg-gray-200 animate-pulse" />
                <div className="h-10 w-10 rounded-lg bg-gray-200 animate-pulse" />
                <div className="h-10 w-10 rounded-lg bg-gray-200 animate-pulse" />
              </div>
            </Card>

            {/* TOC skeleton */}
            <Card
              className="hidden lg:block w-64"
              style={{
                borderRadius: 16,
                border: 'none',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
              }}
            >
              <div className="h-6 w-20 rounded bg-gray-200 animate-pulse mb-4" />
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="h-4 rounded bg-gray-100 animate-pulse mb-2"
                  style={{ width: `${60 + (i % 3) * 15}%` }}
                />
              ))}
            </Card>
          </div>

          {/* Comments skeleton */}
          <Card
            className="mt-8"
            style={{
              borderRadius: 16,
              border: 'none',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
            }}
          >
            <div className="h-8 w-32 rounded bg-gray-200 animate-pulse mb-6" />
            <div className="h-24 rounded-lg bg-gray-50 animate-pulse mb-6" />
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-3 mb-4 pb-4 border-b border-gray-100">
                <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse shrink-0" />
                <div className="flex-1">
                  <div className="h-4 w-1/4 rounded bg-gray-200 animate-pulse mb-2" />
                  <div className="h-4 w-full rounded bg-gray-100 animate-pulse mb-1" />
                  <div className="h-4 w-3/4 rounded bg-gray-100 animate-pulse" />
                </div>
              </div>
            ))}
          </Card>
        </div>
      </section>
    </div>
  );
};

export default ArticleDetailSkeleton;
