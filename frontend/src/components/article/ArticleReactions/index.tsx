import React, { useState, useCallback } from 'react';
import { Tooltip, message } from 'antd';
import { useModel, request } from 'umi';

const EMOJIS = ['🔥', '👏', '🎉', '😢', '💡'] as const;

const EMOJI_LABELS: Record<string, string> = {
  '🔥': '精彩',
  '👏': '鼓掌',
  '🎉': '恭喜',
  '😢': '感动',
  '💡': '有启发',
};

export interface ArticleReactionsProps {
  articleId: string;
  /** 评论发表成功后回调（如刷新列表、滚动到评论区） */
  onPosted?: () => void;
}

const ArticleReactions: React.FC<ArticleReactionsProps> = ({ articleId, onPosted }) => {
  const { githubToken, requireAuth, isLoggedIn } = useModel('githubUserModel');
  const [postingEmoji, setPostingEmoji] = useState<string | null>(null);

  const postReactionAsComment = useCallback(
    (emoji: string) => {
      const label = EMOJI_LABELS[emoji] || '表情';
      const content = `${emoji} ${label}`;

      requireAuth(async () => {
        if (!isLoggedIn || !githubToken) {
          message.warning('请先登录后再发送');
          return;
        }
        setPostingEmoji(emoji);
        try {
          const res = await request('/api/comments', {
            method: 'POST',
            headers: { Authorization: `Bearer ${githubToken}` },
            data: { articleId, content },
          });
          if (res.code === 0) {
            message.success('已同步到评论区');
            onPosted?.();
          } else {
            message.error(res.message || '发送失败');
          }
        } catch (err: any) {
          const status = err?.response?.status;
          const body = err?.response?.data || err?.data;
          const code = body?.code;
          if (status === 429 || code === 24003) {
            message.warning(body?.message || '操作太频繁，请稍后再试');
          } else {
            message.error(body?.message || err?.message || '发送失败');
          }
        } finally {
          setPostingEmoji(null);
        }
      });
    },
    [articleId, githubToken, isLoggedIn, onPosted, requireAuth],
  );

  return (
    <>
      <style>{`
        /* 轻微错位，避免五个表情完全同相位 */
        @keyframes article-reaction-float {
          0%, 100% { transform: translate3d(0, 0, 0) rotate(0deg); }
          25% { transform: translate3d(0, -3px, 0) rotate(-5deg); }
          50% { transform: translate3d(0, -1px, 0) rotate(0deg); }
          75% { transform: translate3d(0, 2px, 0) rotate(5deg); }
        }
        @keyframes article-reaction-pop {
          0% { transform: scale(1); }
          35% { transform: scale(1.32); }
          70% { transform: scale(0.96); }
          100% { transform: scale(1); }
        }
        @keyframes article-reaction-glow {
          0%, 100% { filter: drop-shadow(0 0 0 rgb(0 0 0 / 0)); }
          50% { filter: drop-shadow(0 2px 6px rgb(59 130 246 / 0.35)); }
        }
        .article-reaction-emoji {
          display: inline-block;
          line-height: 1;
          transform-origin: 50% 80%;
        }
        @media (prefers-reduced-motion: no-preference) {
          .article-reaction-btn:not(:disabled) .article-reaction-emoji {
            animation: article-reaction-float var(--reaction-dur, 2.6s) ease-in-out infinite;
            animation-delay: var(--reaction-delay, 0s);
          }
          .article-reaction-btn:not(:disabled):hover .article-reaction-emoji {
            --reaction-dur: 1.15s;
            animation-name: article-reaction-float, article-reaction-glow;
            animation-duration: var(--reaction-dur), 1.4s;
            animation-timing-function: ease-in-out, ease-in-out;
            animation-iteration-count: infinite, infinite;
          }
          .article-reaction-btn:not(:disabled).article-reaction-btn--posting .article-reaction-emoji {
            animation: article-reaction-pop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 1 both !important;
            filter: none;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .article-reaction-emoji {
            animation: none !important;
            filter: none !important;
          }
        }
      `}</style>
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          {EMOJIS.map((emoji, index) => {
            const busy = postingEmoji !== null;
            const isPosting = postingEmoji === emoji;
            return (
              <Tooltip
                key={emoji}
                title={`${EMOJI_LABELS[emoji]} · 点击发表为评论（需登录）`}
                placement="top"
              >
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => postReactionAsComment(emoji)}
                  className={[
                    'article-reaction-btn group flex flex-col items-center justify-center gap-0.5 px-2 py-1.5 rounded-card-sm',
                    'transition-[transform,box-shadow,background-color] duration-200',
                    'bg-gray-50 hover:bg-gray-100 hover:-translate-y-0.5 hover:shadow-md',
                    'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none',
                    isPosting ? 'article-reaction-btn--posting' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  style={{
                    border: '2px solid transparent',
                    cursor: busy ? 'wait' : 'pointer',
                    minWidth: 48,
                  }}
                  aria-label={`${EMOJI_LABELS[emoji]}，发表为评论`}
                >
                  <span
                    className="article-reaction-emoji"
                    style={
                      {
                        fontSize: 22,
                        ['--reaction-delay' as string]: `${index * 0.18}s`,
                      } as React.CSSProperties
                    }
                    aria-hidden
                  >
                    {emoji}
                  </span>
                </button>
              </Tooltip>
            );
          })}
        </div>
        <span className="text-xs text-gray-400 hidden sm:inline">快捷表情会作为一条评论发布，与正文评论一样展示</span>
      </div>
    </>
  );
};

export default ArticleReactions;
