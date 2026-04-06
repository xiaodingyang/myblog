/**
 * 访客统计后台页面
 * 功能：
 * 1. 总览卡片：总访问量、UV、PV、今日访问
 * 2. 热门页面列表
 * 3. 访问趋势图表
 */

import { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Table, message, Spin } from 'antd';
import {
  EyeOutlined,
  UserOutlined,
  FileTextOutlined,
  CalendarOutlined,
} from '@ant-design/icons';
import { Line, Column } from '@ant-design/charts';
import { request } from 'umi';

interface StatsOverview {
  totalVisits: number;
  uniqueVisitors: number;
  pageViews: number;
  todayVisits: number;
}

interface PopularPage {
  path: string;
  title: string;
  visits: number;
  uniqueVisitors: number;
}

interface TrendData {
  date: string;
  visits: number;
  type: string;
}

const StatsPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState<StatsOverview>({
    totalVisits: 0,
    uniqueVisitors: 0,
    pageViews: 0,
    todayVisits: 0,
  });
  const [popularPages, setPopularPages] = useState<PopularPage[]>([]);
  const [trendData, setTrendData] = useState<TrendData[]>([]);

  // 获取统计数据
  const fetchStats = async () => {
    setLoading(true);
    try {
      // 获取总览数据
      const overviewRes = await request('/api/stats/overview');
      if (overviewRes.code === 0) {
        setOverview(overviewRes.data);
      }

      // 获取热门页面
      const popularRes = await request('/api/stats/popular-pages', {
        params: { limit: 10 },
      });
      if (popularRes.code === 0) {
        setPopularPages(popularRes.data);
      }

      // 获取访问趋势（最近 7 天）
      const trendRes = await request('/api/stats/trend', {
        params: { days: 7 },
      });
      if (trendRes.code === 0) {
        setTrendData(trendRes.data);
      }
    } catch (error) {
      message.error('获取统计数据失败');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  // 热门页面表格列配置
  const columns = [
    {
      title: '排名',
      key: 'rank',
      width: 80,
      render: (_: any, __: any, index: number) => (
        <span className="font-semibold text-gray-600">{index + 1}</span>
      ),
    },
    {
      title: '页面路径',
      dataIndex: 'path',
      key: 'path',
      ellipsis: true,
      render: (path: string) => (
        <span className="text-blue-600 font-mono text-sm">{path}</span>
      ),
    },
    {
      title: '页面标题',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
    },
    {
      title: '访问次数',
      dataIndex: 'visits',
      key: 'visits',
      width: 120,
      sorter: (a: PopularPage, b: PopularPage) => a.visits - b.visits,
      render: (visits: number) => (
        <span className="font-semibold text-green-600">{visits.toLocaleString()}</span>
      ),
    },
    {
      title: '独立访客',
      dataIndex: 'uniqueVisitors',
      key: 'uniqueVisitors',
      width: 120,
      sorter: (a: PopularPage, b: PopularPage) => a.uniqueVisitors - b.uniqueVisitors,
      render: (uv: number) => (
        <span className="font-semibold text-purple-600">{uv.toLocaleString()}</span>
      ),
    },
  ];

  // 访问趋势折线图配置
  const lineConfig = {
    data: trendData,
    xField: 'date',
    yField: 'visits',
    seriesField: 'type',
    smooth: true,
    animation: {
      appear: {
        animation: 'path-in',
        duration: 1000,
      },
    },
    legend: {
      position: 'top' as const,
    },
    xAxis: {
      label: {
        autoRotate: false,
      },
    },
    yAxis: {
      label: {
        formatter: (v: string) => `${Number(v).toLocaleString()}`,
      },
    },
    tooltip: {
      formatter: (datum: any) => {
        return {
          name: datum.type,
          value: datum.visits.toLocaleString(),
        };
      },
    },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Spin size="large" tip="加载统计数据中..." />
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* 页面标题 */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">访客统计</h1>
        <p className="text-gray-500 mt-1">实时监控网站访问数据</p>
      </div>

      {/* 总览卡片 */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} lg={6}>
          <Card
            bordered={false}
            className="shadow-sm hover:shadow-md transition-shadow"
          >
            <Statistic
              title="总访问量"
              value={overview.totalVisits}
              prefix={<EyeOutlined className="text-blue-500" />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card
            bordered={false}
            className="shadow-sm hover:shadow-md transition-shadow"
          >
            <Statistic
              title="独立访客 (UV)"
              value={overview.uniqueVisitors}
              prefix={<UserOutlined className="text-green-500" />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card
            bordered={false}
            className="shadow-sm hover:shadow-md transition-shadow"
          >
            <Statistic
              title="页面浏览量 (PV)"
              value={overview.pageViews}
              prefix={<FileTextOutlined className="text-purple-500" />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card
            bordered={false}
            className="shadow-sm hover:shadow-md transition-shadow"
          >
            <Statistic
              title="今日访问"
              value={overview.todayVisits}
              prefix={<CalendarOutlined className="text-orange-500" />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 访问趋势图表 */}
      <Card
        title="访问趋势（最近 7 天）"
        bordered={false}
        className="shadow-sm mb-6"
      >
        <Line {...lineConfig} />
      </Card>

      {/* 热门页面列表 */}
      <Card
        title="热门页面 TOP 10"
        bordered={false}
        className="shadow-sm"
      >
        <Table
          columns={columns}
          dataSource={popularPages}
          rowKey="path"
          pagination={false}
          scroll={{ x: 800 }}
        />
      </Card>
    </div>
  );
};

export default StatsPage;
