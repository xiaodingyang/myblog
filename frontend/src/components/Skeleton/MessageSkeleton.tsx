import React from 'react';
import { Card, Skeleton } from 'antd';

const MessageSkeleton: React.FC = () => {
  return (
    <div className="animate-fade-in py-8">
      <div className="max-w-4xl mx-auto px-6">
        {/* Title skeleton */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 rounded-2xl bg-gray-200 animate-pulse mx-auto mb-4" />
          <div className="h-10 w-32 rounded-lg bg-gray-200 animate-pulse mx-auto mb-3" />
          <div className="h-5 w-48 rounded bg-gray-200 animate-pulse mx-auto" />
        </div>

        {/* Content area */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-lg relative z-10">
          {/* Form skeleton */}
          <Card
            className="mb-8"
            style={{ borderRadius: 16, border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            bodyStyle={{ padding: 24 }}
          >
            <div className="h-6 w-24 rounded bg-gray-200 animate-pulse mb-6" />
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse shrink-0" />
              <div className="flex-1 space-y-3">
                <div className="h-24 rounded-lg bg-gray-100 animate-pulse" />
                <div className="h-4 w-1/3 rounded bg-gray-100 animate-pulse" />
              </div>
            </div>
          </Card>

          {/* List skeleton */}
          <Card
            style={{ borderRadius: 16, border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            bodyStyle={{ padding: 24 }}
          >
            <div className="h-6 w-24 rounded bg-gray-200 animate-pulse mb-6" />
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex gap-3 mb-6 pb-6 border-b border-gray-100 last:border-0">
                <div className="w-12 h-12 rounded-full bg-gray-200 animate-pulse shrink-0" />
                <div className="flex-1">
                  <div className="flex gap-3 mb-2">
                    <div className="h-4 w-24 rounded bg-gray-200 animate-pulse" />
                    <div className="h-4 w-32 rounded bg-gray-100 animate-pulse" />
                  </div>
                  <div className="h-4 w-full rounded bg-gray-100 animate-pulse mb-1" />
                  <div className="h-4 w-3/4 rounded bg-gray-100 animate-pulse" />
                </div>
              </div>
            ))}
            {/* Pagination skeleton */}
            <div className="flex justify-center mt-6 pt-6 border-t border-gray-100">
              <div className="h-8 w-48 rounded-lg bg-gray-200 animate-pulse" />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MessageSkeleton;
