import React from 'react';
import { Empty as AntEmpty, Button } from 'antd';
import { Link } from 'umi';
import { FileSearchOutlined } from '@ant-design/icons';

interface EmptyProps {
  description?: string;
  showAction?: boolean;
  actionText?: string;
  actionLink?: string;
}

const Empty: React.FC<EmptyProps> = ({
  description = '暂无数据',
  showAction = false,
  actionText = '返回首页',
  actionLink = '/',
}) => {
  return (
    <div className="py-16">
      <AntEmpty
        image={
          <FileSearchOutlined 
            className="text-6xl text-gray-300" 
          />
        }
        description={
          <span className="text-gray-400">{description}</span>
        }
      >
        {showAction && (
          <Link to={actionLink}>
            <Button type="primary">{actionText}</Button>
          </Link>
        )}
      </AntEmpty>
    </div>
  );
};

export default Empty;
