import React from 'react';
import { LinkOutlined } from '@ant-design/icons';
import { message } from 'antd';

interface CopyPageUrlButtonProps {
  className?: string;
}

function copyText(text: string) {
  if (navigator.clipboard?.writeText) {
    return navigator.clipboard.writeText(text);
  }
  return new Promise<void>((resolve, reject) => {
    const input = document.createElement('input');
    input.value = text;
    document.body.appendChild(input);
    input.select();
    try {
      document.execCommand('copy');
      resolve();
    } catch (e) {
      reject(e);
    } finally {
      document.body.removeChild(input);
    }
  });
}

const CopyPageUrlButton: React.FC<CopyPageUrlButtonProps> = ({ className }) => {
  const handleClick = async () => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    try {
      await copyText(url);
      message.success('链接已复制');
    } catch {
      message.error('复制失败，请手动复制地址栏链接');
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={
        className ||
        'inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200'
      }
      style={{ border: '1px solid #e5e7eb', background: 'none', cursor: 'pointer' }}
    >
      <LinkOutlined />
      复制链接
    </button>
  );
};

export default CopyPageUrlButton;
