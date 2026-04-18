import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Tooltip } from 'antd';

const EMOJIS = ['🔥', '👏', '🎉', '😢', '💡'];

const EMOJI_LABELS: Record<string, string> = {
  '🔥': '精彩',
  '👏': '鼓掌',
  '🎉': '恭喜',
  '😢': '感动',
  '💡': '有启发',
};

interface ReactionCount {
  [emoji: string]: number;
}

const REACTION_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

const ArticleReactions: React.FC<{ articleId: string }> = ({ articleId }) => {
  const [counts, setCounts] = useState<ReactionCount>({});
  const [myReaction, setMyReaction] = useState<string | null>(null);
  const [animatingEmoji, setAnimatingEmoji] = useState<string | null>(null);
  const [shrinkingEmoji, setShrinkingEmoji] = useState<string | null>(null);

  // Load from localStorage and server
  useEffect(() => {
    const key = `reactions_${articleId}`;
    const stored = localStorage.getItem(key);
    const now = Date.now();

    let localCounts: ReactionCount = {};
    let reactedEmoji: string | null = null;

    if (stored) {
      try {
        const data = JSON.parse(stored);
        if (data.expiry > now) {
          localCounts = data.counts || {};
          reactedEmoji = data.emoji || null;
        } else {
          localStorage.removeItem(key);
        }
      } catch {
        localStorage.removeItem(key);
      }
    }

    setMyReaction(reactedEmoji);
    setCounts(localCounts);
  }, [articleId]);

  const handleReact = useCallback((emoji: string) => {
    const key = `reactions_${articleId}`;
    const stored = localStorage.getItem(key);
    const now = Date.now();

    let data: { counts: ReactionCount; emoji: string | null; expiry: number } = {
      counts: counts,
      emoji: myReaction,
      expiry: now + REACTION_EXPIRY_MS,
    };

    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.expiry > now) {
          data = parsed;
        }
      } catch {
        // ignore
      }
    }

    // Toggle reaction
    if (data.emoji === emoji) {
      // Remove reaction - shrink animation
      setShrinkingEmoji(emoji);
      setTimeout(() => setShrinkingEmoji(null), 200);
      data.counts[emoji] = Math.max(0, (data.counts[emoji] || 0) - 1);
      data.emoji = null;
      setMyReaction(null);
    } else {
      // Add reaction - bounce animation
      setAnimatingEmoji(emoji);
      setTimeout(() => setAnimatingEmoji(null), 200);
      // Remove old reaction count
      if (data.emoji) {
        data.counts[data.emoji] = Math.max(0, (data.counts[data.emoji] || 0) - 1);
      }
      // Add new reaction
      data.counts[emoji] = (data.counts[emoji] || 0) + 1;
      data.emoji = emoji;
      setMyReaction(emoji);
    }

    data.expiry = now + REACTION_EXPIRY_MS;
    localStorage.setItem(key, JSON.stringify(data));
    setCounts({ ...data.counts });
  }, [articleId, counts, myReaction]);

  return (
    <>
      <style>{`
        @keyframes emoji-bounce {
          0% { transform: scale(1); }
          50% { transform: scale(1.3); }
          100% { transform: scale(1); }
        }
        @keyframes emoji-shrink {
          0% { transform: scale(1); }
          50% { transform: scale(0.7); }
          100% { transform: scale(1); }
        }
      `}</style>
      <div className="flex items-center gap-3">
        {EMOJIS.map((emoji) => {
          const count = counts[emoji] || 0;
          const isActive = myReaction === emoji;
          const isBouncing = animatingEmoji === emoji;
          const isShrinking = shrinkingEmoji === emoji;
          return (
            <Tooltip key={emoji} title={EMOJI_LABELS[emoji]} placement="top">
              <button
                onClick={() => handleReact(emoji)}
                className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-card-sm transition-all duration-200 ${
                  isActive ? 'bg-blue-50 scale-110' : 'bg-gray-50 hover:bg-gray-100'
                }`}
                style={{
                  border: isActive ? '2px solid #1677ff' : '2px solid transparent',
                  cursor: 'pointer',
                  minWidth: 48,
                }}
              >
                <span
                  style={{
                    fontSize: 20,
                    display: 'inline-block',
                    animation: isBouncing
                      ? 'emoji-bounce 200ms ease-in-out'
                      : isShrinking
                        ? 'emoji-shrink 200ms ease-in-out'
                        : 'none',
                  }}
                >
                  {emoji}
                </span>
                <span
                  className="text-xs font-medium"
                  style={{ color: isActive ? '#1677ff' : '#666' }}
                >
                  {count > 0 ? count : ''}
                </span>
              </button>
            </Tooltip>
          );
        })}
      </div>
    </>
  );
};

export default ArticleReactions;
