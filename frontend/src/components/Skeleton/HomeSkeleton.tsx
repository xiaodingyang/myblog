import React from 'react';
import { Skeleton, Card, Space, Typography, Row, Col } from 'antd';
import { EyeOutlined } from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

const HomeSkeleton: React.FC = () => {
  return (
    <div
      className="home-fullscreen-scroll h-full overflow-y-auto relative"
      style={{ scrollSnapType: 'y mandatory', scrollBehavior: 'smooth', zIndex: 10, position: 'relative' }}
    >
      {/* Hero skeleton */}
      <section
        className="home-fullscreen-section w-full relative flex items-center justify-center overflow-hidden"
        style={{ background: 'transparent', position: 'relative', zIndex: 10 }}
      >
        <div className="relative z-10 max-w-6xl mx-auto px-4 md:px-6 flex flex-col lg:flex-row items-center gap-4 md:gap-8 lg:gap-16">
          <div className="flex-1 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm mb-4 md:mb-8 border border-white/10">
              <div className="w-5 h-5 rounded bg-gray-600 animate-pulse" />
              <div className="w-32 h-4 rounded bg-gray-600 animate-pulse" />
            </div>
            <Skeleton.Input active size="large" style={{ width: '80%', height: 60 }} />
            <div className="mt-4" />
            <Skeleton.Input active size="large" style={{ width: '60%', height: 60 }} />
            <div className="mt-6">
              <Paragraph>
                <Skeleton.Input active style={{ width: 300, height: 20 }} />
              </Paragraph>
            </div>
            <div className="flex justify-center lg:justify-start gap-3 md:gap-5 mt-8">
              <div className="w-40 h-12 rounded-full bg-gray-700 animate-pulse" />
              <div className="w-36 h-12 rounded-full bg-gray-700 animate-pulse" />
            </div>
          </div>
          <div className="flex-1 hidden lg:block">
            <div className="relative">
              <div className="relative bg-gray-900/80 rounded-2xl p-8 backdrop-blur-sm border border-white/10">
                <div className="flex gap-2 mb-6">
                  <div className="w-3.5 h-3.5 rounded-full bg-red-500" />
                  <div className="w-3.5 h-3.5 rounded-full bg-yellow-500" />
                  <div className="w-3.5 h-3.5 rounded-full bg-green-500" />
                </div>
                <div className="space-y-2">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="flex gap-2">
                      <div className="w-16 h-4 rounded bg-gray-700 animate-pulse" />
                      <div className="w-24 h-4 rounded bg-gray-700 animate-pulse" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured section skeleton */}
      <section
        className="home-fullscreen-section w-full relative flex flex-col"
        style={{ background: 'transparent', position: 'relative', zIndex: 10 }}
      >
        <div className="home-fullscreen-section-inner w-full flex flex-col py-6 md:py-8">
          <div className="max-w-6xl mx-auto px-4 md:px-6 w-full">
            <div className="text-center mb-4 md:mb-8 lg:mb-12 bg-white/95 backdrop-blur-sm rounded-2xl p-4 md:p-6 shadow-lg">
              <div className="w-24 h-6 rounded-full bg-gray-200 animate-pulse mx-auto mb-3" />
              <div className="w-32 h-8 rounded bg-gray-200 animate-pulse mx-auto mb-2" />
              <div className="w-48 h-5 rounded bg-gray-100 animate-pulse mx-auto" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6">
              <div className="lg:col-span-7">
                <div className="relative overflow-hidden rounded-2xl md:rounded-3xl h-full min-h-[280px] md:min-h-[400px] bg-gray-800/50 animate-pulse" />
              </div>
              <div className="lg:col-span-5 flex flex-col gap-4 md:gap-6">
                <div className="relative overflow-hidden rounded-2xl h-[180px] md:h-[190px] bg-gray-800/50 animate-pulse" />
                <div className="relative overflow-hidden rounded-2xl h-[180px] md:h-[190px] bg-gray-800/50 animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Latest section skeleton */}
      <section
        className="home-fullscreen-section w-full relative flex flex-col"
        style={{ background: 'transparent', position: 'relative', zIndex: 10 }}
      >
        <div className="home-fullscreen-section-inner w-full flex flex-col py-6 md:py-8">
          <div className="max-w-6xl mx-auto px-4 md:px-6 w-full">
            <div className="text-center mb-4 md:mb-8 lg:mb-12 bg-white/95 backdrop-blur-sm rounded-2xl p-4 md:p-6 shadow-lg">
              <div className="w-24 h-6 rounded-full bg-gray-200 animate-pulse mx-auto mb-3" />
              <div className="w-32 h-8 rounded bg-gray-200 animate-pulse mx-auto mb-2" />
              <div className="w-48 h-5 rounded bg-gray-100 animate-pulse mx-auto" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
              {[1, 2, 3].map((i) => (
                <Card key={i} hoverable className="overflow-hidden" style={{ borderRadius: 16 }}>
                  <Skeleton.Image active style={{ width: '100%', height: 208 }} />
                  <div className="p-4 space-y-3">
                    <Skeleton.Input active style={{ width: '80%', height: 24 }} />
                    <Skeleton.Input active style={{ width: '100%', height: 16 }} />
                    <Skeleton.Input active style={{ width: '60%', height: 16 }} />
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Explore section skeleton */}
      <section
        className="home-fullscreen-section w-full relative flex flex-col"
        style={{ background: 'transparent', position: 'relative', zIndex: 10 }}
      >
        <div className="home-fullscreen-section-inner w-full flex flex-col py-6 md:py-8">
          <div className="max-w-6xl mx-auto px-4 md:px-6 w-full">
            <div className="text-center mb-4 md:mb-8 lg:mb-12 bg-white/95 backdrop-blur-sm rounded-2xl p-4 md:p-6 shadow-lg">
              <div className="w-24 h-6 rounded-full bg-gray-200 animate-pulse mx-auto mb-3" />
              <div className="w-32 h-8 rounded bg-gray-200 animate-pulse mx-auto mb-2" />
              <div className="w-48 h-5 rounded bg-gray-100 animate-pulse mx-auto" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8">
              <Card style={{ borderRadius: 16 }}>
                <div className="space-y-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex items-center gap-4 p-3 rounded-xl">
                      <div className="w-14 h-14 rounded-2xl bg-gray-200 animate-pulse" />
                      <div className="flex-1 space-y-2">
                        <Skeleton.Input active style={{ width: '60%', height: 20 }} />
                        <Skeleton.Input active style={{ width: '80%', height: 14 }} />
                      </div>
                      <div className="w-12 h-6 rounded-full bg-gray-200 animate-pulse" />
                    </div>
                  ))}
                </div>
              </Card>
              <Card style={{ borderRadius: 16 }}>
                <div className="flex flex-wrap gap-3">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                    <div key={i} className="w-20 h-8 rounded-full bg-gray-200 animate-pulse" />
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA section skeleton */}
      <section
        className="home-fullscreen-section w-full relative flex flex-col items-center justify-center"
        style={{ background: 'transparent', position: 'relative', zIndex: 10 }}
      >
        <div className="relative z-10 max-w-4xl mx-auto px-4 md:px-6 text-center bg-black/50 backdrop-blur-sm rounded-2xl md:rounded-3xl p-6 md:p-12 shadow-2xl">
          <div className="w-16 h-16 rounded-full bg-gray-700 animate-pulse mx-auto mb-6" />
          <div className="w-64 h-10 rounded-lg bg-gray-700 animate-pulse mx-auto mb-4" />
          <div className="w-96 h-5 rounded bg-gray-700 animate-pulse mx-auto mb-8" />
          <div className="flex justify-center gap-4">
            <div className="w-36 h-12 rounded-full bg-gray-700 animate-pulse" />
            <div className="w-36 h-12 rounded-full bg-gray-700 animate-pulse" />
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomeSkeleton;
