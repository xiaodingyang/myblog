import React from 'react';
import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

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

  if (fullScreen) {
    return (
      <div 
        className="fixed inset-0 flex items-center justify-center z-50"
        style={{ 
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(4px)',
        }}
      >
        <div className="text-center">
          <Spin indicator={antIcon} size={size} />
          <p className="mt-4 text-gray-500">{tip}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-20">
      <Spin indicator={antIcon} tip={tip} size={size} />
    </div>
  );
};

export default Loading;
