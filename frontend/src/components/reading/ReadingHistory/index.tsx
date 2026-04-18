import React, { useEffect, useState } from 'react';
import { Link } from 'umi';
import { Typography, Empty } from 'antd';
import { ClockCircleOutlined, DeleteOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/zh-cn';

dayjs.extend(relativeTime);
dayjs.locale('zh-cn');

const { Text, Paragraph } = Typography;

export interface ReadingHistoryItem {
  articleId: string;
  title: string;
  cover?: string;
  summary?: string;
  readAt: string;
}

const STORAGE_KEY = 'reading_history';
const MAX_ITEMS = 20;

export function getReadingHistory(): ReadingHistoryItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addReadingHistory(item: ReadingHistoryItem): void {
  const list = getReadingHistory().filter(h => h.articleId !== item.articleId);
  list.unshift(item);
  if (list.length > MAX_ITEMS) list.length = MAX_ITEMS;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

export function clearReadingHistory(): void {
  localStorage.removeItem(STORAGE_KEY);
}

const ReadingHistory: React.FC = () => {
  const [history, setHistory] = useState<ReadingHistoryItem[]>([]);

  useEffect(() => {
    setHistory(getReadingHistory());

    const handler = () => setHistory(getReadingHistory());
    window.addEventListener('reading-history-updated', handler);
    return () => window.removeEventListener('reading-history-updated', handler);
  }, []);

  if (history.length === 0) return null;

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-card-lg p-4 md:p-6 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <ClockCircleOutlined style={{ color: '#8b5cf6' }} />
          <Text strong className="text-base">最近阅读</Text>
        </div>
        <button
          className="text-xs text-gray-400 hover:text-red-400 flex items-center gap-1 transition-colors"
          onClick={() => { clearReadingHistory(); setHistory([]); }}
        >
          <DeleteOutlined /> 清空
        </button>
      </div>
      <div className="space-y-2 max-h-[300px] overflow-y-auto">
        {history.slice(0, 10).map(item => (
          <Link key={item.articleId} to={`/article/${item.articleId}`} className="block group">
            <div className="flex items-start gap-3 p-2 rounded-card-sm hover:bg-gray-50 transition-colors">
              {item.cover && (
                <img src={item.cover} alt="" className="w-12 h-12 rounded-card-sm object-cover flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <Text className="!text-sm font-medium block truncate group-hover:text-blue-500 transition-colors">
                  {item.title}
                </Text>
                {item.summary && (
                  <Paragraph
                    className="!text-xs !text-gray-400 !mb-0 !mt-0.5 truncate hidden group-hover:block"
                    ellipsis={{ rows: 1 }}
                  >
                    {item.summary}
                  </Paragraph>
                )}
                <Text className="!text-xs !text-gray-300">{dayjs(item.readAt).fromNow()}</Text>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default ReadingHistory;
