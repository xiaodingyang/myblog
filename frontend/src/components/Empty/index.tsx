import React from 'react';
import { Empty as AntEmpty, Button, Typography } from 'antd';
import { Link } from 'umi';
import { FileSearchOutlined, HomeOutlined, ArrowLeftOutlined } from '@ant-design/icons';

const { Text, Paragraph } = Typography;

interface EmptyProps {
  description?: string;
  /** 自定义副标题 */
  subDescription?: string;
  showAction?: boolean;
  actionText?: string;
  actionLink?: string;
  /** 是否显示"返回首页"按钮 */
  showHomeButton?: boolean;
  /** 自定义图标 */
  icon?: React.ReactNode;
  /** 额外操作按钮 */
  extraActions?: React.ReactNode;
}

const Empty: React.FC<EmptyProps> = ({
  description = '暂无数据',
  subDescription,
  showAction = false,
  actionText = '返回首页',
  actionLink = '/',
  showHomeButton = true,
  icon,
  extraActions,
}) => {
  return (
    <div className="py-16">
      <AntEmpty
        image={
          icon || (
            <div className="flex flex-col items-center">
              <FileSearchOutlined className="text-6xl text-gray-200 mb-4" />
              <Text className="text-gray-400 text-sm">这里空空如也</Text>
            </div>
          )
        }
        description={
          <div className="flex flex-col items-center gap-2">
            <span className="text-gray-500 font-medium text-base">{description}</span>
            {subDescription && (
              <Paragraph className="!mb-0 text-gray-400 text-sm text-center max-w-sm">
                {subDescription}
              </Paragraph>
            )}
          </div>
        }
      >
        <div className="flex flex-col items-center gap-3">
          {showAction && (
            <Link to={actionLink}>
              <Button type="primary" icon={<ArrowLeftOutlined />}>
                {actionText}
              </Button>
            </Link>
          )}
          {showHomeButton && (!showAction || actionLink !== '/') && (
            <Link to="/">
              <Button type="text" icon={<HomeOutlined />} className="text-gray-400 hover:text-gray-600">
                返回首页
              </Button>
            </Link>
          )}
          {extraActions}
        </div>
      </AntEmpty>
    </div>
  );
};

export default Empty;
