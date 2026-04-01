import React from 'react';
import { Card, Skeleton, Row, Col } from 'antd';

const ArticlesListSkeleton: React.FC = () => {
  return (
    <div className="animate-fade-in py-6 md:py-8">
      <div className="max-w-6xl mx-auto px-4 md:px-6">
        {/* Title skeleton */}
        <div className="text-center mb-8 md:mb-12">
          <div className="h-10 w-48 rounded-lg bg-gray-200 animate-pulse mx-auto mb-3" />
          <div className="h-5 w-64 rounded bg-gray-200 animate-pulse mx-auto" />
        </div>

        {/* Filter card skeleton */}
        <Card
          className="mb-8"
          style={{ borderRadius: 16, border: '1px solid #f0f0f0', boxShadow: 'none' }}
          bodyStyle={{ padding: 16 }}
        >
          <Row gutter={[16, 16]}>
            <Col xs={24} md={8}>
              <div className="h-10 rounded-lg bg-gray-200 animate-pulse" />
            </Col>
            <Col xs={12} md={6}>
              <div className="h-10 rounded-lg bg-gray-200 animate-pulse" />
            </Col>
            <Col xs={12} md={6}>
              <div className="h-10 rounded-lg bg-gray-200 animate-pulse" />
            </Col>
            <Col xs={24} md={4}>
              <div className="h-4 w-20 rounded bg-gray-200 animate-pulse" />
            </Col>
          </Row>
        </Card>

        {/* Articles grid skeleton */}
        <Row gutter={[24, 24]}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Col xs={24} sm={12} lg={8} key={i}>
              <Card
                hoverable
                className="h-full overflow-hidden"
                style={{ borderRadius: 16, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                cover={
                  <div className="h-52 bg-gray-200 animate-pulse" />
                }
                bodyStyle={{ padding: 16 }}
              >
                <div className="space-y-3">
                  <div className="h-6 w-3/4 rounded bg-gray-200 animate-pulse" />
                  <div className="h-4 w-full rounded bg-gray-100 animate-pulse" />
                  <div className="h-4 w-5/6 rounded bg-gray-100 animate-pulse" />
                  <div className="h-4 w-2/3 rounded bg-gray-100 animate-pulse" />
                  <div className="pt-3 border-t border-gray-100 flex justify-between">
                    <div className="h-4 w-20 rounded bg-gray-100 animate-pulse" />
                    <div className="h-4 w-16 rounded bg-gray-100 animate-pulse" />
                  </div>
                </div>
              </Card>
            </Col>
          ))}
        </Row>

        {/* Pagination skeleton */}
        <div className="flex justify-center mt-8 md:mt-12">
          <div className="h-10 w-64 rounded-lg bg-gray-200 animate-pulse" />
        </div>
      </div>
    </div>
  );
};

export default ArticlesListSkeleton;
