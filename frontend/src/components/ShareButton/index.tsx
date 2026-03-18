import React, { useState } from 'react';
import { Popover, message } from 'antd';
import { ShareAltOutlined, LinkOutlined, QqOutlined, WeiboCircleOutlined } from '@ant-design/icons';
import { QRCodeSVG } from 'qrcode.react';
import { useModel } from 'umi';

interface ShareButtonProps {
  title: string;
  summary?: string;
  url?: string;
  cover?: string;
  mode?: 'icon' | 'button';
}

const PROD_ORIGIN = 'https://www.xiaodingyang.art';

function getShareUrl() {
  if (typeof window === 'undefined') return '';
  const { pathname, search, hash } = window.location;
  return `${PROD_ORIGIN}${pathname}${search}${hash}`;
}

function shareToQQ(title: string, summary: string, url: string, cover?: string) {
  let qqUrl = `https://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}&summary=${encodeURIComponent(summary)}&site=${encodeURIComponent('若风的博客')}`;
  if (cover) qqUrl += `&pics=${encodeURIComponent(cover)}`;
  window.open(qqUrl, '_blank', 'width=600,height=500');
}

function shareToWeibo(title: string, url: string, cover?: string) {
  let weiboUrl = `https://service.weibo.com/share/share.php?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`;
  if (cover) weiboUrl += `&pic=${encodeURIComponent(cover)}`;
  window.open(weiboUrl, '_blank', 'width=600,height=500');
}

function copyLink(url: string) {
  navigator.clipboard.writeText(url).then(() => {
    message.success('链接已复制到剪贴板');
  }).catch(() => {
    const input = document.createElement('input');
    input.value = url;
    document.body.appendChild(input);
    input.select();
    document.execCommand('copy');
    document.body.removeChild(input);
    message.success('链接已复制到剪贴板');
  });
}

const ShareButton: React.FC<ShareButtonProps> = ({
  title,
  summary = '',
  url,
  cover,
  mode = 'button',
}) => {
  const [open, setOpen] = useState(false);
  const { isLoggedIn, requireAuth } = useModel('githubUserModel');
  const shareUrl = url || getShareUrl();

  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen && !isLoggedIn) {
      requireAuth();
      return;
    }
    setOpen(newOpen);
  };

  const content = (
    <div style={{ width: 220 }}>
      <div style={{ textAlign: 'center', marginBottom: 12 }}>
        <QRCodeSVG value={shareUrl} size={140} level="M" />
        <div style={{ color: '#999', fontSize: 12, marginTop: 6 }}>
          微信扫码分享
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 16 }}>
        <button
          onClick={() => { shareToQQ(title, summary, shareUrl, cover); setOpen(false); }}
          style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
            background: 'none', border: 'none', cursor: 'pointer', padding: '6px 10px',
            borderRadius: 8, transition: 'background 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = '#f5f5f5')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
        >
          <QqOutlined style={{ fontSize: 22, color: '#12B7F5' }} />
          <span style={{ fontSize: 11, color: '#666' }}>QQ空间</span>
        </button>
        <button
          onClick={() => { shareToWeibo(title, shareUrl, cover); setOpen(false); }}
          style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
            background: 'none', border: 'none', cursor: 'pointer', padding: '6px 10px',
            borderRadius: 8, transition: 'background 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = '#f5f5f5')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
        >
          <WeiboCircleOutlined style={{ fontSize: 22, color: '#E6162D' }} />
          <span style={{ fontSize: 11, color: '#666' }}>微博</span>
        </button>
        <button
          onClick={() => { copyLink(shareUrl); setOpen(false); }}
          style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
            background: 'none', border: 'none', cursor: 'pointer', padding: '6px 10px',
            borderRadius: 8, transition: 'background 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = '#f5f5f5')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
        >
          <LinkOutlined style={{ fontSize: 22, color: '#666' }} />
          <span style={{ fontSize: 11, color: '#666' }}>复制</span>
        </button>
      </div>
    </div>
  );

  return (
    <Popover
      content={content}
      trigger="click"
      open={open}
      onOpenChange={handleOpenChange}
      placement="bottomRight"
      arrow={{ pointAtCenter: true }}
    >
      {mode === 'icon' ? (
        <button
          className="inline-flex items-center justify-center w-8 h-8 rounded-full text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-all duration-200"
          style={{ background: 'none', border: 'none', cursor: 'pointer' }}
          onClick={(e) => e.preventDefault()}
        >
          <ShareAltOutlined style={{ fontSize: 14 }} />
        </button>
      ) : (
        <button
          className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200"
          style={{ background: 'none', border: '1px solid #e5e7eb', cursor: 'pointer' }}
        >
          <ShareAltOutlined />
          分享
        </button>
      )}
    </Popover>
  );
};

export default ShareButton;
