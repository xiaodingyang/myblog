import React, { useState, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { message } from 'antd';
import type { TocItem } from '@/utils/markdownToc';

/** 常见语言别名 → refractor 注册名，避免高亮退化成纯文本 */
const PRISM_LANG_ALIASES: Record<string, string> = {
  js: 'javascript',
  jsx: 'jsx',
  ts: 'typescript',
  tsx: 'tsx',
  sh: 'bash',
  shell: 'bash',
  zsh: 'bash',
  yml: 'yaml',
  md: 'markdown',
  rs: 'rust',
  py: 'python',
};

function normalizePrismLanguage(lang: string): string {
  const key = lang.trim().toLowerCase();
  return PRISM_LANG_ALIASES[key] || key;
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

  const lang = normalizePrismLanguage(language || 'text');

  return (
    <div className="article-syntax-block relative group/code my-4 rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={handleCopy}
        className="absolute top-2 right-2 z-20 px-2.5 py-1 text-xs font-medium rounded-md border border-white/20 bg-slate-800/85 text-slate-100 hover:bg-slate-700/95 hover:border-white/30 shadow-md transition-colors"
      >
        {copied ? '已复制' : '复制'}
      </button>
      <SyntaxHighlighter
        style={vscDarkPlus}
        language={lang}
        PreTag="div"
        useInlineStyles
        customStyle={{
          margin: 0,
          borderRadius: '8px',
          fontSize: '12px',
          overflowX: 'auto',
          paddingTop: '2.25rem',
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
  toc: TocItem[];
}

const MarkdownArticleBody: React.FC<MarkdownArticleBodyProps> = ({ content, toc }) => {
  let tocWalk = 0;

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeRaw]}
      components={{
        // 避免外层 <pre> 套在 Prism 外，触发 .markdown-body pre code 覆盖行内高亮色
        pre: ({ children }) => <>{children}</>,
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
          const match = /language-([\w-]+)/.exec(className || '');
          const isInline = !match && !className;
          const raw = String(children).replace(/\n$/, '');
          if (!isInline) {
            return (
              <CodeBlockWithCopy language={match ? match[1] : 'text'} code={raw} />
            );
          }
          return (
            <code
              className="bg-gray-100 text-pink-600 px-1.5 py-0.5 rounded text-sm font-mono"
              {...props}
            >
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
