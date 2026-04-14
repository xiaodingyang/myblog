/**
 * 访客统计后台页面
 * 5 区域：数据卡片 / 趋势图 / 热门页面 / 来源饼图 / 访问记录
 */

import React, { useEffect, useState, useCallback, lazy, Suspense } from 'react';
import {
  Card, Row, Col, Statistic, Table, Segmented, Input, DatePicker, Button,
  Spin, Empty, Skeleton, Pagination, message,
} from 'antd';
import {
  EyeOutlined, UserOutlined, ClockCircleOutlined, BarChartOutlined,
  ExclamationCircleOutlined, InboxOutlined, ReloadOutlined, SearchOutlined,
} from '@ant-design/icons';
import { Pie } from '@ant-design/charts';
import { request } from 'umi';
import { useModel } from 'umi';
import { getColorThemeById } from '@/config/colorThemes';
const TrendChart = lazy(() => import('@/components/visual/TrendChart'));

// ========== 类型 ==========

interface OverviewData { pv: number; uv: number; avgDuration: number; }
interface TopPageItem { path: string; title: string; pv: number; uv: number; }
interface TrendData { dates: string[]; pv: number[]; uv: number[]; }
interface RefererItem { source: string; count: number; }
interface VisitItem {
  _id: string; path: string; title: string; ip: string; referer: string; timestamp: string;
}
interface VisitsResponse {
  total: number; page: number; pageSize: number; data: VisitItem[];
}

type RegionState = 'loading' | 'success' | 'error';

// ========== 玻璃拟态卡片样式 ==========

const glassStyle: React.CSSProperties = {
  background: 'rgba(255, 255, 255, 0.6)',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  borderRadius: 12,
  border: '1px solid rgba(255, 255, 255, 0.3)',
  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
};

// ========== 工具函数 ==========

function formatDuration(seconds: number): string {
  if (!seconds) return '--';
  if (seconds < 60) return `${Math.round(seconds)}s`;
  if (seconds < 3600) {
    const m = Math.floor(seconds / 60);
    const s = Math.round(seconds % 60);
    return s > 0 ? `${m}m ${s}s` : `${m}m`;
  }
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

const RANGE_MAP: Record<string, string> = {
  '今日': 'today', '昨日': 'yesterday', '本周': 'week', '本月': 'month',
};

const RANGE_KEYS = ['today', 'yesterday', 'week', 'month'];

// ========== 子组件 ==========

const ErrorBlock: React.FC<{
  onRetry: () => void;
  message?: string;
}> = ({ onRetry, message: errorMsg }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 0' }}>
    <ExclamationCircleOutlined style={{ fontSize: 32, color: '#f59e0b' }} />
    <p style={{ color: '#64748b', fontSize: 14, marginTop: 12 }}>
      {errorMsg || '数据加载失败'}
    </p>
    <Button type="primary" ghost onClick={onRetry} icon={<ReloadOutlined />}>重试</Button>
  </div>
);

const EmptyBlock: React.FC = () => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 0' }}>
    <InboxOutlined style={{ fontSize: 48, color: '#cbd5e1' }} />
    <p style={{ color: '#94a3b8', fontSize: 14, marginTop: 8 }}>暂无数据</p>
  </div>
);

const LoadingBlock: React.FC = () => (
  <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
    <Spin />
  </div>
);

// ========== 主组件 ==========

const StatsPage: React.FC = () => {
  const { themeId } = useModel('colorModel');
  const themeColor = getColorThemeById(themeId)?.primary || '#10b981';

  // 全局状态
  const [timeRange, setTimeRange] = useState<string>('today');
  const [trendDays, setTrendDays] = useState<number>(7);

  // 数据
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [trend, setTrend] = useState<TrendData | null>(null);
  const [topPages, setTopPages] = useState<TopPageItem[]>([]);
  const [referers, setReferers] = useState<RefererItem[]>([]);
  const [visits, setVisits] = useState<VisitsResponse | null>(null);

  // 各区域加载状态
  const [states, setStates] = useState<Record<string, RegionState>>({
    overview: 'loading', trend: 'loading', topPages: 'loading', referers: 'loading', visits: 'loading',
  });

  // 访问记录筛选
  const [filter, setFilter] = useState({ page: 1, pageSize: 20, path: '', startDate: '', endDate: '' });

  // 设置区域状态
  const setRegion = useCallback((region: string, state: RegionState) => {
    setStates(prev => ({ ...prev, [region]: state }));
  }, []);

  // ===== 数据获取 =====

  const fetchData = useCallback(async () => {
    setStates({ overview: 'loading', trend: 'loading', topPages: 'loading', referers: 'loading', visits: 'loading' });

    const results = await Promise.allSettled([
      request('/api/stats/overview', { params: { range: timeRange } }),
      request('/api/stats/trend', { params: { days: trendDays } }),
      request('/api/stats/top-pages', { params: { limit: 10, range: timeRange } }),
      request('/api/stats/referers', { params: { limit: 5, range: timeRange } }),
      request('/api/stats/visits', { params: filter }),
    ]);

    const handlers: Array<{ region: string; setter: (data: any) => void }> = [
      { region: 'overview', setter: setOverview },
      { region: 'trend', setter: setTrend },
      { region: 'topPages', setter: setTopPages },
      { region: 'referers', setter: setReferers },
      { region: 'visits', setter: setVisits },
    ];

    results.forEach((r, i) => {
      if (r.status === 'fulfilled' && r.value?.code === 0) {
        handlers[i].setter(r.value.data);
        setRegion(handlers[i].region, 'success');
      } else {
        const error = r.status === 'rejected' ? r.reason : r.value;

        if (error?.response?.status === 401) {
          message.error('登录已过期，请重新登录');
        } else if (error?.response?.status === 403) {
          message.error('无权限访问统计数据');
        } else if (error?.response?.status === 500) {
          message.error('服务器错误，请稍后重试');
        } else if (!navigator.onLine) {
          message.error('网络连接已断开');
        }

        setRegion(handlers[i].region, 'error');
      }
    });
  }, [timeRange, trendDays, filter, setRegion]);

  // 初始加载 + 依赖变化时重新加载
  useEffect(() => { fetchData(); }, [fetchData]);

  // 60s 静默刷新卡片
  useEffect(() => {
    const timer = setInterval(() => {
      request('/api/stats/overview', { params: { range: timeRange } })
        .then((res: any) => { if (res?.code === 0) setOverview(res.data); })
        .catch(() => {});
    }, 60000);
    return () => clearInterval(timer);
  }, [timeRange]);

  // ===== 事件处理 =====

  const handleVisitsSearch = useCallback(() => {
    setFilter(prev => ({ ...prev, page: 1 }));
  }, []);

  const handlePageChange = useCallback((page: number, pageSize: number) => {
    setFilter(prev => ({ ...prev, page, pageSize }));
  }, []);

  const handleResetFilter = useCallback(() => {
    setFilter({ page: 1, pageSize: 20, path: '', startDate: '', endDate: '' });
  }, []);

  // ===== 渲染 =====

  return (
    <div style={{ padding: 16, minHeight: '100vh' }}>
      {/* 页面标题 + 时间范围切换 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h1 style={{ fontSize: 20, fontWeight: 600, color: '#1e293b', margin: 0 }}>访客统计</h1>
        <Segmented
          options={['今日', '昨日', '本周', '本月']}
          onChange={(val) => setTimeRange(RANGE_MAP[val as string] || 'today')}
        />
      </div>

      {/* ===== 区域 1：数据卡片 ===== */}
      <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
        {([
          { icon: <EyeOutlined />, label: 'PV（页面浏览）', value: overview?.pv ?? 0, isNum: true },
          { icon: <UserOutlined />, label: 'UV（独立访客）', value: overview?.uv ?? 0, isNum: true },
          { icon: <ClockCircleOutlined />, label: '平均停留', value: formatDuration(overview?.avgDuration ?? 0), isNum: false },
          { icon: <BarChartOutlined />, label: '昨日 UV', value: '--', isNum: false },
        ] as const).map((card, i) => (
          <Col xs={24} sm={12} lg={6} key={i}>
            <Card bordered={false} style={{ ...glassStyle, padding: 16 }}>
              {states.overview === 'loading' ? (
                <Skeleton active paragraph={{ rows: 2 }} />
              ) : states.overview === 'error' ? (
                <ErrorBlock onRetry={fetchData} />
              ) : (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                    <span style={{ color: themeColor, fontSize: 18 }}>{card.icon}</span>
                    <span style={{ fontSize: 13, color: '#64748b' }}>{card.label}</span>
                  </div>
                  <Statistic
                    value={card.value}
                    valueStyle={{ fontSize: 28, fontWeight: 600, color: '#1e293b' }}
                    formatter={(val: any) =>
                      card.isNum && typeof val === 'number' ? val.toLocaleString() : String(val)
                    }
                  />
                </>
              )}
            </Card>
          </Col>
        ))}
      </Row>

      {/* ===== 区域 2：访问趋势图（Canvas 占位） ===== */}
      <Card bordered={false} style={{ ...glassStyle, padding: 16, marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <span style={{ fontSize: 15, fontWeight: 500, color: '#1e293b' }}>访问趋势</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ display: 'flex', gap: 16, fontSize: 12, color: '#64748b' }}>
              <span><span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: themeColor }} /> PV</span>
              <span><span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: themeColor, opacity: 0.5 }} /> UV</span>
            </div>
            <Segmented
              options={['7天', '30天']}
              onChange={(val) => setTrendDays(val === '7天' ? 7 : 30)}
            />
          </div>
        </div>
        <div style={{ height: 240, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {states.trend === 'loading' ? (
            <LoadingBlock />
          ) : states.trend === 'error'? (
            <ErrorBlock onRetry={fetchData} />
          ) : trend ? (
            <Suspense fallback={<LoadingBlock />}><TrendChart dates={trend.dates} pv={trend.pv} uv={trend.uv} height={200} /></Suspense>
          ) : <EmptyBlock />}
        </div>
      </Card>

      {/* ===== 区域 3+4：热门页面 + 来源饼图 ===== */}
      <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
        {/* 区域 3：热门页面 */}
        <Col xs={24} lg={14}>
          <Card bordered={false} style={{ ...glassStyle, padding: 16 }}>
            <h3 style={{ fontSize: 15, fontWeight: 500, color: '#1e293b', marginBottom: 12 }}>热门页面 Top 10</h3>
            {states.topPages === 'loading' ? (
              <Skeleton active paragraph={{ rows: 5 }} />
            ) : states.topPages === 'error'? (
              <ErrorBlock onRetry={fetchData} />
            ) : topPages.length === 0 ? (
              <EmptyBlock />
            ) : (
              <div style={{ height: 320 }}>
                <Table
                  dataSource={topPages}
                  rowKey="path"
                  pagination={false}
                  scroll={{ x: 600, y: 280 }}
                  size="small"
                  columns={[
                  {
                    title: '排名', key: 'rank', width: 60, align: 'center',
                    render: (_: any, __: any, idx: number) =>
                      idx < 3 ? (
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                          width: 24, height: 24, borderRadius: '50%',
                          background: themeColor, color: '#fff', fontSize: 12, fontWeight: 'bold',
                        }}>{idx + 1}</span>
                      ) : <span style={{ color: '#64748b' }}>{idx + 1}</span>,
                  },
                  { title: '页面路径', dataIndex: 'path', ellipsis: { showTitle: true },
                    render: (p: string) => <span style={{ fontFamily: 'monospace', fontSize: 13 }}>{p}</span>,
                  },
                  { title: 'PV', dataIndex: 'pv', width: 80, align: 'right',
                    render: (v: number) => <span style={{ fontWeight: 600 }}>{v.toLocaleString()}</span>,
                  },
                  { title: 'UV', dataIndex: 'uv', width: 80, align: 'right',
                    render: (v: number) => <span style={{ fontWeight: 600 }}>{v.toLocaleString()}</span>,
                  },
                ]}
              />
              </div>
            )}
          </Card>
        </Col>

        {/* 区域 4：来源饼图 */}
        <Col xs={24} lg={10}>
          <Card bordered={false} style={{ ...glassStyle, padding: 16 }}>
            <h3 style={{ fontSize: 15, fontWeight: 500, color: '#1e293b', marginBottom: 12 }}>访客来源</h3>
            {states.referers === 'loading' ? (
              <Skeleton active avatar paragraph={{ rows: 1 }} />
            ) : states.referers === 'error'? (
              <ErrorBlock onRetry={fetchData} />
            ) : referers.length === 0 ? (
              <EmptyBlock />
            ) : (
              <Pie
                data={referers.map(r => ({ name: r.source, value: r.count }))}
                angleField="value"
                colorField="name"
                innerRadius={0.6}
                statistic={{
                  title: { style: { fontSize: '11px', color: '#64748b' }, content: '总访问' },
                  value: {
                    style: { fontSize: '20px', fontWeight: 'bold', color: '#1e293b' },
                    content: referers.reduce((s, r) => s + r.count, 0).toLocaleString(),
                  },
                }}
                legend={{ position: 'bottom' as const }}
                label={false}
                interactions={[{ type: 'element-active' }]}
                height={320}
              />
            )}
          </Card>
        </Col>
      </Row>

      {/* ===== 区域 5：访问记录 ===== */}
      <Card bordered={false} style={{ ...glassStyle, padding: 16 }}>
        <h3 style={{ fontSize: 15, fontWeight: 500, color: '#1e293b', marginBottom: 12 }}>访问记录</h3>

        {/* 筛选栏 */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
          <Input
            placeholder="输入页面路径筛选"
            value={filter.path}
            onChange={e => setFilter(prev => ({ ...prev, path: e.target.value }))}
            style={{ width: 200 }}
            onPressEnter={handleVisitsSearch}
            prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
          />
          <Input
            type="date"
            value={filter.startDate}
            onChange={e => setFilter(prev => ({ ...prev, startDate: e.target.value }))}
            style={{ width: 140 }}
            placeholder="开始日期"
          />
          <span style={{ color: '#64748b', lineHeight: '32px' }}>~</span>
          <Input
            type="date"
            value={filter.endDate}
            onChange={e => setFilter(prev => ({ ...prev, endDate: e.target.value }))}
            style={{ width: 140 }}
            placeholder="结束日期"
          />
          <Button type="primary" onClick={handleVisitsSearch} style={{ background: themeColor, borderColor: themeColor }}>
            搜索
          </Button>
          <Button onClick={handleResetFilter}>重置</Button>
        </div>

        {/* 表格 */}
        {states.visits === 'loading' ? (
          <Skeleton active paragraph={{ rows: 5 }} />
        ) : states.visits === 'error'? (
          <ErrorBlock onRetry={fetchData} />
        ) : (
          <>
            <Table
              dataSource={visits?.data || []}
              rowKey="_id"
              pagination={false}
              scroll={{ x: 800 }}
              size="small"
              columns={[
                {
                  title: '时间', dataIndex: 'timestamp', width: 180,
                  render: (t: string) => new Date(t).toLocaleString('zh-CN'),
                },
                { title: '页面路径', dataIndex: 'path', ellipsis: { showTitle: true } },
                { title: '标题', dataIndex: 'title', width: 200, ellipsis: { showTitle: true } },
                {
                  title: 'IP', dataIndex: 'ip', width: 140,
                  render: (ip: string) => <span>{ip || '--'}</span>,
                },
                {
                  title: '来源', dataIndex: 'referer', width: 160, ellipsis: { showTitle: true },
                  render: (r: string) => {
                    if (!r) return '直接访问';
                    try { return new URL(r).hostname; } catch { return r; }
                  },
                },
              ]}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
              <Pagination
                current={filter.page}
                pageSize={filter.pageSize}
                total={visits?.total || 0}
                showTotal={total => `共 ${total} 条`}
                pageSizeOptions={['10', '20', '50']}
                onChange={handlePageChange}
                onShowSizeChange={handlePageChange}
                style={{
                  color: '#1e293b',
                }}
                className="stats-pagination"
              />
            </div>
          </>
        )}
      </Card>
    </div>
  );
};

export default StatsPage;
