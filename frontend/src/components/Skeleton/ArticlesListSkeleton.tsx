import React from 'react';

/**
 * ArticlesListSkeleton — 匹配 杂志Hero + 瀑布流时间线 布局
 */
const shimmer = 'bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-[skeleton-shimmer_1.5s_ease_infinite]';

const CardSkeleton: React.FC<{ showCover?: boolean }> = ({ showCover = true }) => (
  <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
    {showCover && <div className={`h-36 sm:h-44 ${shimmer}`} />}
    <div className="p-4 space-y-2.5">
      <div className={`h-3 w-24 rounded ${shimmer}`} />
      <div className={`h-4 w-3/4 rounded ${shimmer}`} />
      <div className={`h-3 w-full rounded ${shimmer}`} />
      <div className={`h-3 w-5/6 rounded ${shimmer}`} />
      <div className="flex gap-2 pt-1">
        <div className={`h-5 w-14 rounded ${shimmer}`} />
        <div className={`h-5 w-14 rounded ${shimmer}`} />
      </div>
      <div className="flex justify-between pt-2 border-t border-gray-50">
        <div className={`h-3 w-16 rounded ${shimmer}`} />
        <div className={`h-3 w-12 rounded ${shimmer}`} />
      </div>
    </div>
  </div>
);

const ArticlesListSkeleton: React.FC = () => {
  const pattern = [true, false, true, true, false, true, false, false];

  return (
    <div className="space-y-10">
      {/* Hero skeleton */}
      <div className={`h-[260px] sm:h-[340px] md:h-[420px] rounded-2xl ${shimmer}`} />

      {/* Section divider */}
      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 rounded-full ${shimmer}`} />
        <div className="h-px flex-1 bg-gray-100" />
        <div className={`h-3 w-16 rounded ${shimmer}`} />
        <div className="h-px flex-1 bg-gray-100" />
      </div>

      {/* Mobile skeleton */}
      <div className="md:hidden relative pl-8 space-y-5">
        <div className="absolute left-[11px] top-0 bottom-0 w-[2px] bg-gray-100 rounded-full" />
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="relative">
            <div className="absolute w-[10px] h-[10px] rounded-full bg-gray-200 ring-[3px] ring-white" style={{ left: -28, top: 16 }} />
            <CardSkeleton showCover={pattern[i % pattern.length]} />
          </div>
        ))}
      </div>

      {/* Desktop skeleton */}
      <div className="hidden md:flex gap-10 relative">
        <div className="absolute left-1/2 -translate-x-[1px] top-0 bottom-0 w-[2px] bg-gray-100 rounded-full" />
        <div className="w-1/2 space-y-6">
          {[0, 1, 2].map((i) => (
            <div key={i} className="relative">
              <div className="absolute -right-[23px] top-5 w-[10px] h-[10px] rounded-full bg-gray-200 ring-[3px] ring-white z-10" />
              <CardSkeleton showCover={pattern[(i * 2) % pattern.length]} />
            </div>
          ))}
        </div>
        <div className="w-1/2 space-y-6 pt-20">
          {[0, 1, 2].map((i) => (
            <div key={i} className="relative">
              <div className="absolute -left-[23px] top-5 w-[10px] h-[10px] rounded-full bg-gray-200 ring-[3px] ring-white z-10" />
              <CardSkeleton showCover={pattern[(i * 2 + 1) % pattern.length]} />
            </div>
          ))}
        </div>
      </div>

      {/* Pagination skeleton */}
      <div className="flex justify-center">
        <div className={`h-8 w-64 rounded-lg ${shimmer}`} />
      </div>
    </div>
  );
};

export default ArticlesListSkeleton;
