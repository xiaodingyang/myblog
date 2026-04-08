import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Modal, Input, List, Tag, Typography, Empty, Space } from 'antd';
import { SearchOutlined, ClockCircleOutlined, CloseOutlined, EnterOutlined } from '@ant-design/icons';
import { request, history } from 'umi';

const { Text, Paragraph } = Typography;

const HISTORY_KEY = 'search_history';
const MAX_HISTORY = 10;

interface GlobalSearchProps {
  open: boolean;
  onClose: () => void;
}

function getHistory(): string[] {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
  } catch {
    return [];
  }
}

function addHistory(keyword: string) {
  const list = getHistory().filter(k => k !== keyword);
  list.unshift(keyword);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(list.slice(0, MAX_HISTORY)));
}

function clearHistory() {
  localStorage.removeItem(HISTORY_KEY);
}

function highlightText(text: string, keyword: string) {
  if (!keyword.trim()) return text;
  const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const parts = text.split(new RegExp(`(${escaped})`, 'gi'));
  return parts.map((part, i) =>
    part.toLowerCase() === keyword.toLowerCase() ? (
      <mark key={i} style={{ background: '#ffe58f', padding: 0, borderRadius: 2 }}>{part}</mark>
    ) : (
      part
    ),
  );
}

const GlobalSearch: React.FC<GlobalSearchProps> = ({ open, onClose }) => {
  const [keyword, setKeyword] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [historyList, setHistoryList] = useState<string[]>([]);
  const inputRef = useRef<any>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // 打开时聚焦 + 加载历史
  useEffect(() => {
    if (open) {
      setKeyword('');
      setResults([]);
      setActiveIndex(-1);
      setHistoryList(getHistory());
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await request('/api/articles', {
        params: { keyword: q, pageSize: 10, page: 1 },
      });
      if (res.code === 0) {
        setResults(res.data.list || []);
      }
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounced search
  const handleInputChange = (value: string) => {
    setKeyword(value);
    setActiveIndex(-1);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!value.trim()) {
      setResults([]);
      setHistoryList(getHistory());
      return;
    }
    setLoading(true);
    debounceRef.current = setTimeout(() => doSearch(value), 300);
  };

  const navigateTo = (articleId: string) => {
    if (keyword.trim()) addHistory(keyword.trim());
    onClose();
    history.push(`/article/${articleId}`);
  };

  const handleHistoryClick = (kw: string) => {
    setKeyword(kw);
    setActiveIndex(-1);
    doSearch(kw);
  };

  // 键盘导航
  const handleKeyDown = (e: React.KeyboardEvent) => {
    const items = keyword.trim() ? results : [];
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(prev => (prev < items.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(prev => (prev > 0 ? prev - 1 : items.length - 1));
    } else if (e.key === 'Enter' && activeIndex >= 0 && items[activeIndex]) {
      e.preventDefault();
      const item = items[activeIndex];
      const id = item._id || item.id;
      if (id) navigateTo(id);
    }
  };

  // 滚动选中项到可视区
  useEffect(() => {
    if (activeIndex >= 0 && listRef.current) {
      const el = listRef.current.querySelector(`[data-index="${activeIndex}"]`);
      el?.scrollIntoView({ block: 'nearest' });
    }
  }, [activeIndex]);

  const showHistory = !keyword.trim() && historyList.length > 0;

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', opacity: 0.45, fontSize: 12 }}>
          <span>↑↓ 选择</span>
          <span><EnterOutlined /> 打开</span>
          <span>Esc 关闭</span>
        </div>
      }
      title={null}
      closable={false}
      destroyOnClose
      width={600}
      className="global-search-modal"
      styles={{
        body: { padding: '12px 0 0' },
      }}
    >
      <Input
        ref={inputRef}
        size="large"
        prefix={<SearchOutlined style={{ color: '#999' }} />}
        placeholder="搜索文章标题、内容..."
        value={keyword}
        onChange={e => handleInputChange(e.target.value)}
        onKeyDown={handleKeyDown}
        allowClear
        style={{ marginBottom: 12, padding: '0 12px' }}
        variant="borderless"
      />

      <div
        ref={listRef}
        style={{ maxHeight: 400, overflowY: 'auto', padding: '0 4px' }}
      >
        {/* 搜索历史 */}
        {showHistory && (
          <div style={{ padding: '0 12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                <ClockCircleOutlined /> 搜索历史
              </Text>
              <a
                onClick={() => { clearHistory(); setHistoryList([]); }}
                style={{ fontSize: 12, color: '#999' }}
              >
                清除
              </a>
            </div>
            <Space wrap style={{ marginBottom: 8 }}>
              {historyList.map(kw => (
                <Tag
                  key={kw}
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleHistoryClick(kw)}
                >
                  {kw}
                </Tag>
              ))}
            </Space>
          </div>
        )}

        {/* 搜索结果 */}
        {keyword.trim() && (
          <List
            loading={loading}
            dataSource={results}
            locale={{ emptyText: loading ? ' ' : <Empty description="没有找到相关文章" image={Empty.PRESENTED_IMAGE_SIMPLE} /> }}
            renderItem={(item: any, index: number) => {
              const id = item._id || item.id;
              return (
                <List.Item
                  data-index={index}
                  onClick={() => id && navigateTo(id)}
                  style={{
                    cursor: 'pointer',
                    padding: '10px 12px',
                    borderRadius: 8,
                    background: index === activeIndex ? 'rgba(0,0,0,0.04)' : 'transparent',
                    transition: 'background 0.2s',
                    border: 'none',
                  }}
                  onMouseEnter={() => setActiveIndex(index)}
                >
                  <List.Item.Meta
                    title={
                      <Text strong style={{ fontSize: 14 }}>
                        {highlightText(item.title || '', keyword)}
                      </Text>
                    }
                    description={
                      <div>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {(item.summary || '').slice(0, 80)}
                          {(item.summary || '').length > 80 ? '...' : ''}
                        </Text>
                        {item.category && (
                          <Tag color="blue" style={{ marginLeft: 8, fontSize: 11 }}>
                            {typeof item.category === 'object' ? item.category.name : item.category}
                          </Tag>
                        )}
                      </div>
                    }
                  />
                </List.Item>
              );
            }}
          />
        )}
      </div>
    </Modal>
  );
};

export default GlobalSearch;
