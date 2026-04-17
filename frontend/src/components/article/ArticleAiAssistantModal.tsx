import React, { useState, useCallback, useEffect, lazy, Suspense } from 'react';
import { createPortal } from 'react-dom';
import { Button, Input, Typography, Space, Alert, List, Spin, Tag, Tooltip } from 'antd';
import { Link, request, useModel } from 'umi';
import { RobotOutlined, CloseOutlined } from '@ant-design/icons';
import { getColorThemeById } from '@/config/colorThemes';
import { ARTICLE_AI_ASSISTANT_NAME } from '@/components/shared/floatingActionsConstants';

const LazyMarkdownArticleBody = lazy(() => import('@/components/article/MarkdownArticleBody'));

const { Paragraph, Text } = Typography;
const { TextArea } = Input;

const DISCLAIMER_KEY = 'blog_ai_assistant_disclaimer_ok_v1';

export type AskAiResponse = {
  answer: string;
  citations: {
    excerpt: string;
    articleId: string;
    articleTitle?: string;
    source?: 'current' | 'category';
  }[];
  meta: {
    model?: string;
    /** grounded：含可选站内摘录；freeform：无摘录 / 全站通用 */
    answerMode?: 'grounded' | 'freeform';
    retrievalEmpty?: boolean;
    categoryBoostUsed?: boolean;
    retrieval?: {
      articleBestScore?: number;
      articleWeak?: boolean;
      categoryUsed?: boolean;
      categorySnippetCount?: number;
      categoryDocCount?: number;
    };
    usage?: unknown;
  };
};

type Props = {
  open: boolean;
  onClose: () => void;
  /** 有值时走 /api/ai/ask；为空时走 /api/ai/chat 全站通用 */
  articleId: string | null;
  articleTitle: string | null;
  githubToken?: string | null;
};

/**
 * 居中「玻璃」答疑层：与 GuestLoginPrompt 同思路，背景仅视觉暗化且不拦截指针，
 * 背后文章可滚动；仅在卡片区域交互。
 */
const ArticleAiAssistantModal: React.FC<Props> = ({
  open,
  onClose,
  articleId,
  articleTitle,
  githubToken,
}) => {
  const { themeId } = useModel('colorModel');
  const theme = getColorThemeById(themeId);

  const [step, setStep] = useState<'disclaimer' | 'chat'>(() =>
    typeof localStorage !== 'undefined' && localStorage.getItem(DISCLAIMER_KEY) === '1' ? 'chat' : 'disclaimer',
  );
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AskAiResponse | null>(null);
  const [errText, setErrText] = useState<string | null>(null);

  const resetForOpen = useCallback(() => {
    setErrText(null);
    setResult(null);
    setQuestion('');
    setStep(
      typeof localStorage !== 'undefined' && localStorage.getItem(DISCLAIMER_KEY) === '1'
        ? 'chat'
        : 'disclaimer',
    );
  }, []);

  useEffect(() => {
    if (open) resetForOpen();
  }, [open, resetForOpen]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const acceptDisclaimer = () => {
    try {
      localStorage.setItem(DISCLAIMER_KEY, '1');
    } catch {
      /* ignore */
    }
    setStep('chat');
  };

  const submit = async () => {
    const q = question.trim();
    if (q.length < 2) return;
    setLoading(true);
    setErrText(null);
    setResult(null);
    try {
      const isArticle = Boolean(articleId);
      const res = await request(isArticle ? '/api/ai/ask' : '/api/ai/chat', {
        method: 'POST',
        timeout: 120000,
        skipErrorHandler: true,
        data: isArticle ? { articleId, question: q } : { question: q },
        headers: githubToken ? { Authorization: `Bearer ${githubToken}` } : {},
      });
      if (res?.code === 0 && res.data) {
        setResult(res.data as AskAiResponse);
      } else {
        setErrText(res?.message || '请求失败');
      }
    } catch (e: any) {
      const status = e?.response?.status;
      const body = e?.response?.data;
      const code = body?.code;
      const isTimeout =
        e?.code === 'ECONNABORTED' ||
        /timeout/i.test(String(e?.message || '')) ||
        status === 408;
      if (isTimeout) {
        setErrText('等待模型回复超时，请稍后再试或缩短问题');
      } else if (status === 429 || code === 42901) {
        setErrText('提问过于频繁，请稍后再试');
      } else {
        setErrText(
          body?.message ||
            e?.info?.errorMessage ||
            (typeof e?.message === 'string' && !e?.message.startsWith('Request failed') ? e.message : null) ||
            '服务暂不可用，请稍后重试',
        );
      }
    } finally {
      setLoading(false);
    }
  };

  if (!open || typeof document === 'undefined') return null;

  const panel = (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6 pointer-events-none"
      aria-modal="true"
      role="dialog"
      aria-labelledby="ai-assistant-title"
    >
      {/* 仅视觉暗化，不抢指针 — 背后正文可滚动、可点 */}
      <div className="absolute inset-0 bg-black/55 backdrop-blur-sm pointer-events-none" aria-hidden />

      <div
        className="relative z-10 w-full max-w-[min(52rem,calc(100vw-1.5rem))] max-h-[min(90vh,800px)] flex flex-col overflow-hidden pointer-events-auto"
        style={{
          borderRadius: 16,
          background:
            'linear-gradient(165deg, rgba(28,32,42,0.98) 0%, rgba(18,21,30,0.98) 42%, rgba(14,16,24,0.99) 100%)',
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: `0 28px 64px rgba(0,0,0,0.62), 0 0 0 1px rgba(255,255,255,0.06), 0 0 48px ${theme.primary}14`,
        }}
      >
        <div
          className="shrink-0 flex items-start justify-between gap-3 px-5 sm:px-6 pt-5 pb-4 border-b border-white/[0.08]"
          style={{
            background:
              'linear-gradient(180deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.02) 55%, transparent 100%)',
          }}
        >
          <div className="flex items-center gap-3.5 min-w-0 pr-2">
            <div
              className="w-11 h-11 rounded-lg flex items-center justify-center shrink-0"
              style={{
                borderRadius: 10,
                backgroundImage: theme.gradient,
                boxShadow: `inset 0 1px 0 rgba(255,255,255,0.22), 0 8px 20px ${theme.primary}40`,
              }}
            >
              <RobotOutlined className="text-lg text-white drop-shadow-sm" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 min-w-0">
                <h2
                  id="ai-assistant-title"
                  className="text-[17px] font-semibold text-white m-0 tracking-tight leading-snug shrink-0"
                >
                  {ARTICLE_AI_ASSISTANT_NAME}
                </h2>
                <Tag className="!m-0 !rounded-full !px-2.5 !py-0.5 !text-[11px] !leading-normal !border-white/22 !bg-transparent !text-white/80">
                  由 AI 生成
                </Tag>
              </div>
              <p className="text-[12px] text-white/50 m-0 mt-1 leading-snug line-clamp-2">
                {articleId
                  ? `可自由提问；摘录与同分类仅供参考，与问题无关时会直接通用解答 · ${articleTitle || '本篇'}`
                  : '全站通用问答：技术、代码、学习问题都可以问'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 shrink-0 pt-0.5">
            <Tooltip title="关闭（Esc）" placement="bottom" mouseEnterDelay={0.2} getPopupContainer={() => document.body} zIndex={5000}>
              <button
                type="button"
                aria-label="关闭"
                onClick={onClose}
                className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 text-white/90 hover:text-white hover:scale-105 active:scale-95"
                style={{
                  borderRadius: 9999,
                  background: `${theme.primary}22`,
                  border: `1px solid ${theme.primary}55`,
                  boxShadow: `0 0 0 1px rgba(0,0,0,0.2), 0 4px 14px ${theme.primary}35`,
                }}
              >
                <CloseOutlined className="text-[13px]" />
              </button>
            </Tooltip>
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto px-5 sm:px-6 py-5 text-white/90">
          {step === 'disclaimer' ? (
            <Space direction="vertical" size="large" className="w-full">
              <div
                className="rounded-lg p-4 border"
                style={{
                  borderRadius: 10,
                  borderColor: 'rgba(255,255,255,0.1)',
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)',
                }}
              >
                <Paragraph className="!mb-0 text-[13px] leading-relaxed text-white/82">
                  <span className="font-semibold text-white/95">使用前须知</span>
                  <span className="mx-1.5 text-white/25">·</span>
                  <span className="text-white/68">
                    回答依据本站已发布正文检索生成，可能存在疏漏或过时。请勿输入密钥、隐私信息。
                  </span>
                </Paragraph>
              </div>
              <div className="flex justify-end pt-1">
                <Button
                  type="primary"
                  size="large"
                  onClick={acceptDisclaimer}
                  className="!rounded-lg !h-10 !px-6 !font-medium !border-0 min-w-[200px] !text-neutral-950 hover:!text-neutral-950"
                  style={{
                    borderRadius: 8,
                    backgroundImage: theme.gradient,
                    boxShadow: `0 6px 22px ${theme.primary}45, inset 0 1px 0 rgba(255,255,255,0.2)`,
                  }}
                >
                  已知上述限制，继续提问
                </Button>
              </div>
            </Space>
          ) : (
            <div className="flex flex-col gap-4 w-full">
              <div>
                <div className="text-[11px] font-medium uppercase tracking-wider text-white/40 mb-2">你的问题</div>
                <TextArea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="用一句话描述你的疑问…"
                  autoSize={{ minRows: 4, maxRows: 10 }}
                  maxLength={2000}
                  disabled={loading}
                  className="!rounded-lg !text-[13px] !leading-relaxed !text-white/92 !border-white/[0.12] placeholder:!text-white/38 [&_textarea]:!min-h-[120px] !shadow-inner transition-[box-shadow,border-color] duration-200 [&:focus-within]:!border-white/[0.2] [&:focus-within]:!shadow-[inset_0_1px_2px_rgba(0,0,0,0.35),0_0_0_1px_rgba(255,255,255,0.06),0_0_20px_rgba(255,255,255,0.04)]"
                  style={{
                    borderRadius: 8,
                    color: 'rgba(255,255,255,0.92)',
                    background: 'rgba(10,12,18,0.55)',
                    boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.35)',
                  }}
                />
              </div>
              <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3 pt-1">
                <Text type="secondary" className="!text-[11px] !text-white/35 sm:order-first">
                  Enter 不会提交，避免误发
                </Text>
                <Button
                  type="primary"
                  size="large"
                  onClick={submit}
                  loading={loading}
                  disabled={question.trim().length < 2}
                  className="!rounded-lg !h-10 !px-8 !font-semibold !border-0 w-full sm:w-auto sm:min-w-[132px] !text-white hover:!text-white"
                  style={{
                    borderRadius: 8,
                    backgroundImage: theme.gradient,
                    boxShadow: `0 6px 22px ${theme.primary}48, inset 0 1px 0 rgba(255,255,255,0.22)`,
                  }}
                >
                  提交问题
                </Button>
              </div>
              {errText && (
                <Alert
                  type="error"
                  message={errText}
                  showIcon
                  className="!text-[13px] !rounded-lg !bg-rose-950/45 !border-rose-500/25 [&_.ant-alert-message]:!text-rose-50 [&_.ant-alert-icon]:!text-rose-300"
                />
              )}
              {loading && (
                <div className="flex justify-center py-10 rounded-lg border border-white/[0.06] bg-black/20">
                  <Spin tip="小苹果正在思考…" className="[&_.ant-spin-text]:!text-[13px] [&_.ant-spin-text]:!text-white/65" />
                </div>
              )}
              {result && !loading && (
                <Suspense
                  fallback={
                    <div className="flex justify-center py-12 rounded-lg border border-white/[0.06] bg-black/20">
                      <Spin tip="加载正文排版…" className="[&_.ant-spin-text]:!text-[13px] [&_.ant-spin-text]:!text-white/65" />
                    </div>
                  }
                >
                  <div className="space-y-4">
                    {result.meta?.answerMode === 'freeform' && (
                      <Alert
                        type="info"
                        message={
                          articleId
                            ? '未检索到与问题相关的站内摘录，以下为通用技术解答（非摘自当前页正文）。'
                            : '全站通用模式：回答基于通用技术知识，与站内单篇正文无绑定。'
                        }
                        showIcon
                        className="!text-[13px] !rounded-lg !bg-sky-950/30 !border-sky-500/20 [&_.ant-alert-message]:!text-sky-50"
                      />
                    )}
                    {result.meta?.retrievalEmpty &&
                      result.meta?.answerMode === 'grounded' &&
                      result.meta?.categoryBoostUsed && (
                        <Alert
                          type="warning"
                          message="当前正文未匹配到强相关段落，已结合同分类其它文章摘录生成下列回答"
                          showIcon
                          className="!text-[13px] !rounded-lg !bg-amber-950/35 !border-amber-400/20 [&_.ant-alert-message]:!text-amber-50"
                        />
                      )}
                    {result.meta?.categoryBoostUsed && !result.meta?.retrievalEmpty && (
                      <Alert
                        type="info"
                        message="已在当前正文基础上补充同分类下的参考摘录"
                        showIcon
                        className="!text-[13px] !rounded-lg !bg-sky-950/30 !border-sky-500/20 [&_.ant-alert-message]:!text-sky-50"
                      />
                    )}
                    <div
                      className="markdown-body markdown-body--dark-panel rounded-lg border p-4 sm:p-5 min-h-0"
                      style={{
                        borderRadius: 10,
                        borderColor: 'rgba(255,255,255,0.08)',
                        background: 'linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(8,10,15,0.45) 100%)',
                      }}
                    >
                      <LazyMarkdownArticleBody
                        content={result.answer}
                        toc={[]}
                        enableHtml={false}
                        embeddedInDarkPanel
                      />
                    </div>
                    {result.citations?.length > 0 && (
                      <List
                        size="small"
                        className="!bg-transparent !text-white/85 [&_.ant-list-header]:!text-white/88 [&_.ant-list-header]:!border-white/[0.08] [&_.ant-list-header]:!pb-2 [&_.ant-list-item]:!border-white/[0.06]"
                        header={<Text strong className="!text-white/90">引用摘录</Text>}
                        dataSource={result.citations}
                        renderItem={(item) => (
                          <List.Item className="!px-0 !py-2 !border-white/10">
                            <div
                              className="markdown-body markdown-body--dark-panel !text-[14px] !leading-relaxed mb-2 min-w-0"
                              style={{ fontSize: 14, lineHeight: 1.65 }}
                            >
                              <LazyMarkdownArticleBody
                                content={item.excerpt}
                                toc={[]}
                                enableHtml={false}
                                embeddedInDarkPanel
                              />
                            </div>
                            <Link
                              to={`/article/${item.articleId}`}
                              onClick={onClose}
                              className="text-sky-300 hover:text-sky-200 text-sm"
                            >
                              {item.source === 'category' && item.articleTitle
                                ? `打开《${item.articleTitle}》`
                                : '打开文章页'}
                            </Link>
                          </List.Item>
                        )}
                      />
                    )}
                  </div>
                </Suspense>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(panel, document.body);
};

export default ArticleAiAssistantModal;
