import React from 'react';
import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { LazyMotionDiv } from '@/utils/lazyMotion';
import { prefersReducedMotion } from '@/utils/motionPrefs';

interface LoadingProps {
  tip?: string;
  size?: 'small' | 'default' | 'large';
  fullScreen?: boolean;
}

const Loading: React.FC<LoadingProps> = ({
  tip = '加载中...',
  size = 'large',
  fullScreen = false,
}) => {
  const antIcon = <LoadingOutlined style={{ fontSize: size === 'large' ? 48 : 24 }} spin />;
  const reducedMotion = prefersReducedMotion();

  const spinner = (
    <LazyMotionDiv
      animate={reducedMotion ? undefined : { scale: [1, 1.05, 1] }}
      transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
      className="flex flex-col items-center"
    >
      <Spin indicator={antIcon} size={size} />
      {tip && <p className="mt-4 text-gray-500">{tip}</p>}
    </LazyMotionDiv>
  );

  if (fullScreen) {
    return (
      <div
        className="fixed inset-0 flex items-center justify-center z-50"
        style={{
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(4px)',
        }}
      >
        {spinner}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-20">
      {spinner}
    </div>
  );
};

export default Loading;
