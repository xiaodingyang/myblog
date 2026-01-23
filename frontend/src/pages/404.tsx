import React from 'react';
import { Link } from 'umi';
import { Button, Typography, Space } from 'antd';
import { HomeOutlined, ArrowLeftOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;

const NotFoundPage: React.FC = () => {
  return (
    <div 
      className="min-h-screen flex items-center justify-center px-6"
      style={{
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      }}
    >
      <div className="text-center max-w-md">
        {/* 404 数字 */}
        <div 
          className="text-[150px] md:text-[200px] font-black leading-none select-none"
          style={{
            background: 'linear-gradient(135deg, #1677ff 0%, #722ed1 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            textShadow: '0 20px 40px rgba(22, 119, 255, 0.2)',
          }}
        >
          404
        </div>

        <Title level={2} className="!mb-4">
          页面走丢了
        </Title>
        
        <Paragraph className="text-gray-500 text-lg mb-8">
          抱歉，你访问的页面不存在或已被移除。
          <br />
          请检查网址是否正确，或返回首页继续浏览。
        </Paragraph>

        <Space size="large">
          <Link to="/">
            <Button 
              type="primary" 
              size="large" 
              icon={<HomeOutlined />}
              className="!rounded-full !px-8"
            >
              返回首页
            </Button>
          </Link>
          <Button 
            size="large" 
            icon={<ArrowLeftOutlined />}
            onClick={() => window.history.back()}
            className="!rounded-full !px-8"
          >
            返回上页
          </Button>
        </Space>
      </div>
    </div>
  );
};

export default NotFoundPage;
