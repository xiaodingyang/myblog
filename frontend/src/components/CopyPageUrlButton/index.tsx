import React, { useState, useRef } from 'react';
import { LinkOutlined, CheckOutlined } from '@ant-design/icons';
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
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleClick = async () => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    try {
      await copyText(url);
      message.success('链接已复制');
      setCopied(true);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setCopied(false), 2000);
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
        'inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm transition-all duration-200'
      }
      style={{
        border: copied ? '1px solid #52c41a' : '1px solid #e5e7eb',
        background: copied ? '#f6ffed' : 'none',
        color: copied ? '#52c41a' : '#4b5563',
        cursor: 'pointer',
      }}
    >
      {copied ? <CheckOutlined /> : <LinkOutlined />}
      {copied ? '已复制 ✓' : '复制链接'}
    </button>
  );
};

export default CopyPageUrlButton;
