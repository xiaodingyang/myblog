import React, { useCallback, useEffect, useState } from 'react';
import { Card, Space, Typography } from 'antd';
import { ClockCircleOutlined } from '@ant-design/icons';

const { Title } = Typography;

type AiNewsItem = {
  _id?: string;
  articleId?: string;
  title: string;
  url: string;
  publishedAt: string;
  source?: { name?: string };
  tags?: string[];
};

const REFRESH_MS = 10 * 60 * 1000;

const AiNewsCard: React.FC = () => {
  const [news, setNews] = useState<AiNewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadNews = useCallback(async (opts?: { silent?: boolean }) => {
    const silent = opts?.silent === true;
    if (!silent) {
      setError(null);
      setLoading(true);
    }
    try {
      const res = await fetch('/api/ai-news?limit=8');
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const json = await res.json();
      if (!json.success || !Array.isArray(json.data)) {
        throw new Error(json.message || '接口返回异常');
      }
      setNews(json.data);
      if (silent) setError(null);
    } catch (e) {
      if (!silent) {
        setError(e instanceof Error ? e : new Error('加载失败'));
        setNews([]);
      }
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadNews({ silent: false });
    const id = window.setInterval(() => void loadNews({ silent: true }), REFRESH_MS);
    return () => window.clearInterval(id);
  }, [loadNews]);

  return (
    <Card
      className="ai-news-card"
      style={{
        background: 'rgba(255, 255, 255, 0.04)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        backdropFilter: 'blur(20px)',
        borderRadius: 16,
        padding: '20px',
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <Title level={5} style={{ color: 'white', margin: 0 }}>
          🤖 AI 资讯
        </Title>
        <span
          className="text-xs px-2 py-1 rounded"
          style={{
            background: 'rgba(239, 68, 68, 0.2)',
            color: 'white',
          }}
        >
          实时
        </span>
      </div>

      <div>
        {loading ? (
          <div className="text-center py-8 text-gray-400">加载中...</div>
        ) : error ? (
          <div className="text-center py-8 text-red-400">加载失败: {error.message}</div>
        ) : news.length > 0 ? (
          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {news.map((item) => {
              const key = item._id || item.articleId || item.url;
              return (
                <a
                  key={key}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block group"
                >
                  <div
                    className="p-3 rounded-lg transition-colors hover:bg-white/5"
                    style={{
                      background: 'rgba(255, 255, 255, 0.02)',
                    }}
                  >
                    <div className="text-white text-sm font-medium mb-1.5 group-hover:underline line-clamp-2">
                      {item.title}
                    </div>
                    <Space className="text-xs" style={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                      <span>
                        <ClockCircleOutlined />{' '}
                        {new Date(item.publishedAt).toLocaleDateString('zh-CN')}
                      </span>
                      {item.source?.name && (
                        <>
                          <span>·</span>
                          <span>{item.source.name}</span>
                        </>
                      )}
                      {item.tags && item.tags.length > 0 && (
                        <>
                          <span>·</span>
                          <span>{item.tags[0]}</span>
                        </>
                      )}
                    </Space>
                  </div>
                </a>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400">暂无新闻</div>
        )}
      </div>

      <div
        className="text-xs text-gray-400 mt-4 text-center"
        style={{ color: 'rgba(255, 255, 255, 0.4)' }}
      >
        数据来源：InfoQ · 每10分钟更新
      </div>
    </Card>
  );
};

export default AiNewsCard;
