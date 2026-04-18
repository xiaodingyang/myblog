import React, { useEffect, useState, useRef } from 'react';
import { CloseOutlined, GithubOutlined, CommentOutlined, HeartOutlined, StarOutlined, TrophyOutlined } from '@ant-design/icons';
import { useModel } from 'umi';
import { getColorThemeById } from '@/config/colorThemes';
import { getOAuthReturnPath } from '@/utils/runtimePath';

const STORAGE_KEY = 'guest_login_prompt_dismissed_until';

const GuestLoginPrompt: React.FC = () => {
  const { isLoggedIn, setLoginModalVisible } = useModel('githubUserModel');
  const { themeId } = useModel('colorModel');
  const theme = getColorThemeById(themeId);
  const [shouldRender, setShouldRender] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);
  const [animateOut, setAnimateOut] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const delayTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (isLoggedIn) {
      setShouldRender(false);
      setAnimateIn(false);
      return;
    }
    const until = Number(localStorage.getItem(STORAGE_KEY) || '0') || 0;
    if (Date.now() > until) {
      // Delay 2 seconds before showing
      delayTimerRef.current = setTimeout(() => {
        setShouldRender(true);
        // Trigger animation after mount
        requestAnimationFrame(() => {
          requestAnimationFrame(() => setAnimateIn(true));
        });
      }, 2000);
    }
    return () => {
      if (delayTimerRef.current) clearTimeout(delayTimerRef.current);
    };
  }, [isLoggedIn]);

  if (!shouldRender || isLoggedIn) return null;

  const dismiss = () => {
    const until = Date.now() + 24 * 60 * 60 * 1000;
    localStorage.setItem(STORAGE_KEY, String(until));
    setAnimateOut(true);
    setTimeout(() => {
      setShouldRender(false);
      setAnimateIn(false);
      setAnimateOut(false);
    }, 350);
  };

  const openLogin = () => {
    setIsLoading(true);
    const returnUrl = encodeURIComponent(getOAuthReturnPath());
    window.location.href = `/api/github/login?returnUrl=${returnUrl}`;
  };

  return (
    <div
      className="fixed z-[100] max-w-sm w-[calc(100vw-2rem)] sm:w-[360px]"
      style={{
        right: 16,
        bottom: 16,
        transform: animateOut
          ? 'translateX(120%) translateY(0)'
          : animateIn
            ? 'translateY(0)'
            : 'translateY(20px)',
        opacity: animateOut ? 0 : animateIn ? 1 : 0,
        transition: 'transform 0.35s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      <div
        className="rounded-card-lg overflow-hidden shadow-2xl border border-white/20"
        style={{
          background: 'linear-gradient(135deg, rgba(15,23,42,0.82) 0%, rgba(30,41,59,0.72) 50%, rgba(15,23,42,0.88) 100%)',
          backdropFilter: 'blur(16px) saturate(160%)',
          WebkitBackdropFilter: 'blur(16px) saturate(160%)',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.06)',
        }}
      >
        <div className="relative p-4 sm:p-5 pt-10 text-white">
          <button
            type="button"
            aria-label="关闭"
            onClick={dismiss}
            className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-105"
            style={{
              color: theme.primary,
              background: `${theme.primary}26`,
              border: `1px solid ${theme.primary}55`,
              boxShadow: `0 2px 8px ${theme.primary}33`,
            }}
          >
            <CloseOutlined />
          </button>
          <div className="flex items-center gap-3 mb-3">
            <div
              className="w-12 h-12 rounded-card-lg flex items-center justify-center shrink-0"
              style={{ backgroundImage: theme.gradient }}
            >
              <GithubOutlined className="text-xl text-white" />
            </div>
            <div>
              <h3 className="text-base font-semibold m-0 text-white">用 GitHub 登录，解锁完整体验</h3>
              <p className="text-xs text-white/65 m-0 mt-1">安全快捷，只读公开资料</p>
            </div>
          </div>
          <ul className="text-sm text-white/85 space-y-2.5 mb-4 m-0 pl-0 list-none">
            <li className="flex items-center gap-2">
              <CommentOutlined className="text-emerald-400 shrink-0" />
              <span>发表评论，参与讨论</span>
            </li>
            <li className="flex items-center gap-2">
              <HeartOutlined className="text-rose-400 shrink-0" />
              <span>为文章和评论点赞</span>
            </li>
            <li className="flex items-center gap-2">
              <StarOutlined className="text-amber-400 shrink-0" />
              <span>收藏文章，随时回看</span>
            </li>
            <li className="flex items-center gap-2">
              <TrophyOutlined className="text-violet-400 shrink-0" />
              <span>查看排行榜与互动数据</span>
            </li>
          </ul>
          <button
            type="button"
            onClick={openLogin}
            disabled={isLoading}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-card-lg text-sm font-medium text-white border-0 cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
            style={{
              background: 'linear-gradient(180deg, #2ea043 0%, #238636 100%)',
              boxShadow: '0 4px 14px rgba(46,160,67,0.35)',
            }}
          >
            <GithubOutlined className={isLoading ? 'animate-spin' : ''} />
            {isLoading ? '跳转中...' : 'GitHub 登录'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GuestLoginPrompt;
