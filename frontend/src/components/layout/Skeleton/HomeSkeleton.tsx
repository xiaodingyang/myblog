import React from 'react';

/** Reusable shimmer block */
const S = ({ w, h, r = 'rounded', dark = false, className = '' }: { w?: string; h?: string; r?: string; dark?: boolean; className?: string }) => (
  <div
    className={`${dark ? 'skeleton-shimmer-dark' : 'skeleton-shimmer'} ${r} ${className}`}
    style={{ width: w, height: h }}
  />
);

const HomeSkeleton: React.FC = () => (
  <div
    className="home-fullscreen-scroll h-full overflow-y-auto relative"
    style={{ scrollSnapType: 'y mandatory', scrollBehavior: 'smooth', zIndex: 10, position: 'relative' }}
  >
    {/* ===== Hero ===== */}
    <section
      className="home-fullscreen-section w-full relative flex items-center justify-center overflow-hidden"
      style={{ background: 'transparent', position: 'relative', zIndex: 10 }}
    >
      <div className="relative z-10 max-w-6xl mx-auto px-4 md:px-6 flex flex-col lg:flex-row items-center gap-4 md:gap-8 lg:gap-16 w-full">
        {/* Left: text */}
        <div className="flex-1 text-center lg:text-left space-y-6">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10">
            <S w="20px" h="20px" r="rounded" dark />
            <S w="120px" h="16px" r="rounded" dark />
          </div>
          {/* Title line 1 */}
          <S w="85%" h="52px" r="rounded-card-sm" dark />
          {/* Title line 2 */}
          <S w="65%" h="52px" r="rounded-card-sm" dark />
          {/* Subtitle */}
          <S w="300px" h="20px" r="rounded" dark className="mt-2" />
          {/* Buttons */}
          <div className="flex justify-center lg:justify-start gap-4 mt-8">
            <S w="160px" h="48px" r="rounded-full" dark />
            <S w="144px" h="48px" r="rounded-full" dark />
          </div>
        </div>

        {/* Right: code window */}
        <div className="flex-1 hidden lg:block">
          <div className="relative bg-gray-900/80 rounded-card-lg p-8 backdrop-blur-sm border border-white/10">
            {/* Traffic lights */}
            <div className="flex gap-2 mb-6">
              <div className="w-3.5 h-3.5 rounded-full bg-red-500/60" />
              <div className="w-3.5 h-3.5 rounded-full bg-yellow-500/60" />
              <div className="w-3.5 h-3.5 rounded-full bg-green-500/60" />
            </div>
            <div className="space-y-3">
              {[75, 55, 90, 40, 70, 60].map((pct, i) => (
                <div key={i} className="flex gap-3">
                  <S w="48px" h="16px" r="rounded" dark />
                  <S w={`${pct}%`} h="16px" r="rounded" dark />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>

    {/* ===== Featured ===== */}
    <section
      className="home-fullscreen-section w-full relative flex flex-col"
      style={{ background: 'transparent', position: 'relative', zIndex: 10 }}
    >
      <div className="home-fullscreen-section-inner w-full flex flex-col py-6 md:py-8">
        <div className="max-w-6xl mx-auto px-4 md:px-6 w-full">
          {/* Section header */}
          <div className="text-center mb-4 md:mb-8 lg:mb-12 bg-white/95 backdrop-blur-sm rounded-card-lg p-4 md:p-6 shadow-lg">
            <S w="96px" h="24px" r="rounded-full" className="mx-auto mb-3" />
            <S w="128px" h="32px" r="rounded" className="mx-auto mb-2" />
            <S w="192px" h="20px" r="rounded" className="mx-auto" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6">
            {/* Big card */}
            <div className="lg:col-span-7 relative overflow-hidden rounded-card-lg md:rounded-card-lg min-h-[280px] md:min-h-[400px] skeleton-shimmer-dark p-6 flex flex-col justify-end">
              <S w="60px" h="24px" r="rounded-full" dark />
              <S w="75%" h="28px" r="rounded-card-sm" dark className="mt-3" />
              <S w="90%" h="16px" r="rounded" dark className="mt-2" />
              <div className="flex items-center gap-3 mt-4">
                <S w="32px" h="32px" r="rounded-full" dark />
                <S w="80px" h="14px" r="rounded" dark />
                <S w="60px" h="14px" r="rounded" dark />
              </div>
            </div>
            {/* 2 small cards */}
            <div className="lg:col-span-5 flex flex-col gap-4 md:gap-6">
              {[1, 2].map(i => (
                <div key={i} className="relative overflow-hidden rounded-card-lg h-[180px] md:h-[190px] skeleton-shimmer-dark p-5 flex flex-col justify-end">
                  <S w="50px" h="20px" r="rounded-full" dark />
                  <S w="80%" h="22px" r="rounded-card-sm" dark className="mt-2" />
                  <div className="flex items-center gap-2 mt-3">
                    <S w="28px" h="28px" r="rounded-full" dark />
                    <S w="64px" h="12px" r="rounded" dark />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>

    {/* ===== Latest ===== */}
    <section
      className="home-fullscreen-section w-full relative flex flex-col"
      style={{ background: 'transparent', position: 'relative', zIndex: 10 }}
    >
      <div className="home-fullscreen-section-inner w-full flex flex-col py-6 md:py-8">
        <div className="max-w-6xl mx-auto px-4 md:px-6 w-full">
          {/* Section header */}
          <div className="text-center mb-4 md:mb-8 lg:mb-12 bg-white/95 backdrop-blur-sm rounded-card-lg p-4 md:p-6 shadow-lg">
            <S w="96px" h="24px" r="rounded-full" className="mx-auto mb-3" />
            <S w="128px" h="32px" r="rounded" className="mx-auto mb-2" />
            <S w="192px" h="20px" r="rounded" className="mx-auto" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="rounded-card-lg overflow-hidden bg-white shadow-md">
                {/* Cover image */}
                <S w="100%" h="208px" r="rounded-none" />
                <div className="p-4 space-y-3">
                  {/* Title */}
                  <S w="80%" h="22px" r="rounded" />
                  {/* Summary lines */}
                  <S w="100%" h="14px" r="rounded" />
                  <S w="70%" h="14px" r="rounded" />
                  {/* Tags */}
                  <div className="flex gap-2 pt-1">
                    <S w="56px" h="24px" r="rounded-full" />
                    <S w="48px" h="24px" r="rounded-full" />
                  </div>
                  {/* Footer: avatar + date + views */}
                  <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                    <S w="24px" h="24px" r="rounded-full" />
                    <S w="72px" h="12px" r="rounded" />
                    <div className="flex-1" />
                    <S w="48px" h="12px" r="rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>

    {/* ===== Explore ===== */}
    <section
      className="home-fullscreen-section w-full relative flex flex-col"
      style={{ background: 'transparent', position: 'relative', zIndex: 10 }}
    >
      <div className="home-fullscreen-section-inner w-full flex flex-col py-6 md:py-8">
        <div className="max-w-6xl mx-auto px-4 md:px-6 w-full">
          {/* Section header */}
          <div className="text-center mb-4 md:mb-8 lg:mb-12 bg-white/95 backdrop-blur-sm rounded-card-lg p-4 md:p-6 shadow-lg">
            <S w="96px" h="24px" r="rounded-full" className="mx-auto mb-3" />
            <S w="128px" h="32px" r="rounded" className="mx-auto mb-2" />
            <S w="192px" h="20px" r="rounded" className="mx-auto" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8">
            {/* Categories card */}
            <div className="rounded-card-lg bg-white shadow-md p-6">
              <div className="space-y-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="flex items-center gap-4 p-3 rounded-card-lg">
                    <S w="56px" h="56px" r="rounded-card-lg" />
                    <div className="flex-1 space-y-2">
                      <S w="60%" h="18px" r="rounded" />
                      <S w="80%" h="14px" r="rounded" />
                    </div>
                    <S w="48px" h="24px" r="rounded-full" />
                  </div>
                ))}
              </div>
            </div>
            {/* Tags card */}
            <div className="rounded-card-lg bg-white shadow-md p-6">
              <div className="flex flex-wrap gap-3">
                {[72, 56, 88, 64, 48, 80, 60, 52].map((w, i) => (
                  <S key={i} w={`${w}px`} h="32px" r="rounded-full" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    {/* ===== CTA ===== */}
    <section
      className="home-fullscreen-section w-full relative flex flex-col items-center justify-center"
      style={{ background: 'transparent', position: 'relative', zIndex: 10 }}
    >
      <div className="relative z-10 max-w-4xl mx-auto px-4 md:px-6 text-center bg-black/50 backdrop-blur-sm rounded-card-lg md:rounded-card-lg p-6 md:p-12 shadow-2xl">
        <S w="64px" h="64px" r="rounded-full" dark className="mx-auto mb-6" />
        <S w="256px" h="40px" r="rounded-card-sm" dark className="mx-auto mb-4" />
        <S w="384px" h="20px" r="rounded" dark className="mx-auto mb-8" />
        <div className="flex justify-center gap-4">
          <S w="144px" h="48px" r="rounded-full" dark />
          <S w="144px" h="48px" r="rounded-full" dark />
        </div>
      </div>
    </section>
  </div>
);

export default HomeSkeleton;
