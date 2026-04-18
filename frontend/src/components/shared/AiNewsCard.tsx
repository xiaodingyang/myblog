import React from 'react';
import { Card, Space, Typography } from 'antd';
import { ClockCircleOutlined, EyeOutlined } from '@ant-design/icons';
import { useSSENews, NewsList } from '@xdy-npm/realtime-rss-hub-react';

const { Text, Title, Paragraph } = Typography;

const AiNewsCard: React.FC = () => {
  const { news, loading, error } = useSSENews('/api/ai-news/stream', {
    limit: 8,
    autoConnect: true,
  });

  // 如果使用 NewsList 组件（来自开源包）
  const useNewsList = false;

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

      {useNewsList ? (
        // 使用开源包的 NewsList 组件
        <NewsList
          endpoint="/api/ai-news/stream"
          limit={8}
          title=""
          emptyText="暂无新闻"
          loadingText="加载中..."
        />
      ) : (
        // 使用自定义渲染，保持博客原有样式
        <div>
          {loading ? (
            <div className="text-center py-8 text-gray-400">
              加载中...
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-400">
              加载失败: {error.message}
            </div>
          ) : news && news.length > 0 ? (
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {news.map((item) => (
                <a
                  key={item._id}
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
                      {item.source && (
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
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              暂无新闻
            </div>
          )}
        </div>
      )}

      <div className="text-xs text-gray-400 mt-4 text-center" style={{ color: 'rgba(255, 255, 255, 0.4)' }}>
        数据来源：InfoQ · 每10分钟更新
      </div>
    </Card>
  );
};

export default AiNewsCard;
