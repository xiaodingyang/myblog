import React, { useState, useCallback, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { message } from 'antd';
import type { TocItem } from '@/utils/markdownToc';
// @ts-ignore - SyntaxHighlighter types are incomplete
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
// @ts-ignore
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

// 预加载代码高亮样式（vscDarkPlus 体积较大，闲置时预加载可改善首次渲染体验）
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
  const preload = () => import('react-syntax-highlighter/dist/esm/styles/prism');
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => preload(), { timeout: 3000 });
  } else {
    setTimeout(() => preload(), 2000);
  }
}

const CodeBlockWithCopy: React.FC<{
  language: string;
  code: string;
}> = ({ language, code }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      message.success('已复制');
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      message.error('复制失败');
    }
  }, [code]);

  return (
    <div className="relative group/code my-4 rounded-lg overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/20">
      {/* 语言标签 */}
      <div className="absolute top-2 left-3 z-20 px-2 py-0.5 text-xs font-medium rounded bg-slate-700/90 text-slate-300 border border-slate-600/50">
        {language}
      </div>
      <button
        type="button"
        onClick={handleCopy}
        className="absolute top-2 right-2 z-20 px-3 py-1.5 text-xs font-medium rounded-md border transition-all duration-200"
        style={{
          borderColor: copied ? '#10b981' : 'rgba(255, 255, 255, 0.2)',
          background: copied ? 'rgba(16, 185, 129, 0.15)' : 'rgba(30, 41, 59, 0.85)',
          color: copied ? '#10b981' : '#e2e8f0',
          transform: copied ? 'scale(0.95)' : 'scale(1)',
        }}
      >
        {copied ? '✓ 已复制' : '复制代码'}
      </button>
      <SyntaxHighlighter
        style={vscDarkPlus}
        language={language}
        PreTag="div"
        customStyle={{
          margin: 0,
          borderRadius: '8px',
          fontSize: '13px',
          lineHeight: '1.6',
          overflowX: 'auto',
          paddingTop: '2.75rem',
          paddingBottom: '1.25rem',
          background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
        }}
        showLineNumbers
        wrapLines
        wrapLongLines
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
};

interface MarkdownArticleBodyProps {
  content: string;
  /** 目录锚点；AI 等场景可传空数组 */
  toc?: TocItem[];
  /** 是否启用 HTML（文章正文）；AI 等不可信 Markdown 应传 false */
  enableHtml?: boolean;
  /** 深色弹窗内：行内 code 等与暗底协调 */
  embeddedInDarkPanel?: boolean;
}

const MarkdownArticleBody: React.FC<MarkdownArticleBodyProps> = ({
  content,
  toc = [],
  enableHtml = true,
  embeddedInDarkPanel = false,
}) => {
  let tocWalk = 0;

  const inlineCodeClass = embeddedInDarkPanel
    ? 'bg-white/15 text-sky-100/95 px-1.5 py-0.5 rounded text-[13px] font-mono'
    : 'bg-gray-100 text-pink-600 px-1.5 py-0.5 rounded text-sm font-mono';

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={enableHtml ? [rehypeRaw] : []}
      components={{
        img: ({ src, alt, ...props }) => (
          <img
            src={src}
            alt={alt || ''}
            loading="lazy"
            decoding="async"
            className="rounded-lg max-w-full h-auto"
            {...props}
          />
        ),
        h2: ({ children, ...props }) => {
          const item = toc[tocWalk];
          if (item?.level === 2) {
            tocWalk += 1;
            return (
              <h2 id={item.id} {...props}>
                {children}
              </h2>
            );
          }
          return <h2 {...props}>{children}</h2>;
        },
        h3: ({ children, ...props }) => {
          const item = toc[tocWalk];
          if (item?.level === 3) {
            tocWalk += 1;
            return (
              <h3 id={item.id} {...props}>
                {children}
              </h3>
            );
          }
          return <h3 {...props}>{children}</h3>;
        },
        code({ className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || '');
          const isInline = !match && !className;
          const raw = String(children).replace(/\n$/, '');
          if (!isInline) {
            return (
              <CodeBlockWithCopy language={match ? match[1] : 'text'} code={raw} />
            );
          }
          return (
            <code className={inlineCodeClass} {...props}>
              {children}
            </code>
          );
        },
      }}
    >
      {content}
    </ReactMarkdown>
  );
};

export default MarkdownArticleBody;
