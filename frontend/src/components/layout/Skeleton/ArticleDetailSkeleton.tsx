import React from 'react';
import { BORDER_RADIUS } from '@/styles/designTokens';

/** Reusable shimmer block */
const S = ({ w, h, r = 'rounded', dark = false, className = '' }: { w?: string; h?: string; r?: string; dark?: boolean; className?: string }) => (
  <div
    className={`${dark ? 'skeleton-shimmer-dark' : 'skeleton-shimmer'} ${r} ${className}`}
    style={{ width: w, height: h }}
  />
);

const ArticleDetailSkeleton: React.FC = () => (
  <div className="animate-fade-in">
    {/* ===== Hero ===== */}
    <section
      className="relative py-16 md:py-24 overflow-hidden"
      style={{ background: 'linear-gradient(rgba(15, 23, 42, 0.8), rgba(15, 23, 42, 0.9))' }}
    >
      <div className="max-w-6xl mx-auto px-4 md:px-6 space-y-5">
        {/* Back button capsule */}
        <S w="100px" h="36px" r="rounded-full" dark />
        {/* Title */}
        <S w="80%" h="44px" r="rounded-card-sm" dark />
        {/* Reading time */}
        <S w="140px" h="20px" r="rounded" dark />
        {/* Author row: avatar + name + date + views */}
        <div className="flex items-center gap-3">
          <S w="40px" h="40px" r="rounded-full" dark />
          <S w="80px" h="18px" r="rounded" dark />
          <S w="96px" h="18px" r="rounded" dark />
          <S w="72px" h="18px" r="rounded" dark />
        </div>
        {/* Tags */}
        <div className="flex gap-2">
          <S w="72px" h="28px" r="rounded-full" dark />
          <S w="64px" h="28px" r="rounded-full" dark />
          <S w="80px" h="28px" r="rounded-full" dark />
        </div>
      </div>
    </section>

    {/* ===== Content + TOC ===== */}
    <section className="py-8 md:py-12">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 lg:items-start">
          {/* Main content card */}
          <div
            className="flex-1 min-w-0 w-full bg-white p-6 md:p-8"
            style={{ borderRadius: BORDER_RADIUS.CARD_LARGE, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          >
            {/* 5 paragraphs: heading + 3 lines each */}
            <div className="space-y-8">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="space-y-3">
                  <S w={`${20 + (i % 3) * 8}%`} h="24px" r="rounded" />
                  <S w="100%" h="16px" r="rounded" />
                  <S w="95%" h="16px" r="rounded" />
                  <S w={`${70 + (i % 2) * 15}%`} h="16px" r="rounded" />
                </div>
              ))}
            </div>

            {/* Divider */}
            <div className="my-6 border-t border-gray-100" />

            {/* Action buttons */}
            <div className="flex flex-wrap items-center gap-3">
              <S w="128px" h="40px" r="rounded-card-sm" />
              <S w="96px" h="40px" r="rounded-card-sm" />
              <S w="40px" h="40px" r="rounded-card-sm" />
              <S w="40px" h="40px" r="rounded-card-sm" />
            </div>
          </div>

          {/* TOC sidebar */}
          <div
            className="hidden lg:block w-64 bg-white p-5"
            style={{ borderRadius: BORDER_RADIUS.CARD_LARGE, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          >
            <S w="80px" h="22px" r="rounded" className="mb-5" />
            {[85, 60, 75, 50, 70].map((pct, i) => (
              <S key={i} w={`${pct}%`} h="16px" r="rounded" className="mb-3" />
            ))}
          </div>
        </div>

        {/* ===== Comments ===== */}
        <div
          className="mt-8 bg-white p-6 md:p-8"
          style={{ borderRadius: BORDER_RADIUS.CARD_LARGE, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
        >
          {/* Title */}
          <S w="120px" h="28px" r="rounded" className="mb-6" />
          {/* Comment input box */}
          <S w="100%" h="96px" r="rounded-card-sm" className="mb-6" />
          {/* 3 comments */}
          {[1, 2, 3].map(i => (
            <div key={i} className="flex gap-3 mb-5 pb-5 border-b border-gray-100 last:border-0">
              <S w="40px" h="40px" r="rounded-full" className="shrink-0" />
              <div className="flex-1 space-y-2">
                <S w="25%" h="16px" r="rounded" />
                <S w="100%" h="14px" r="rounded" />
                <S w="75%" h="14px" r="rounded" />
              </div>
            </div>
          ))}
        </div>

        {/* ===== Related articles ===== */}
        <div className="mt-8">
          <S w="140px" h="28px" r="rounded" className="mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="rounded-card-lg overflow-hidden bg-white shadow-md">
                <S w="100%" h="160px" r="rounded-none" />
                <div className="p-4 space-y-2">
                  <S w="80%" h="18px" r="rounded" />
                  <S w="100%" h="14px" r="rounded" />
                  <S w="60%" h="14px" r="rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  </div>
);

export default ArticleDetailSkeleton;
