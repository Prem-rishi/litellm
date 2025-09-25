"use client";

import React, { useEffect, useState } from "react";
import { Table, Spin, Alert, Tag, Badge, Collapse, Card as AntCard } from "antd";
import { Card, Grid, Title, Text, DonutChart, BarChart, Col } from "@tremor/react";
import { ClockCircleOutlined, InfoCircleOutlined, WarningOutlined, CloseCircleOutlined } from '@ant-design/icons';
import moment from "moment";

interface ObservabilityLog {
  timestamp: string;
  type: string;
  message: string;
  metadata: Record<string, any>;
}

interface MetricsStats {
  totalLogs: number;
  byType: Record<string, number>;
  recentActivity: number;
  // Enhanced fields from the API
  recentModelsUsed?: string[];
  totalRecentSpend?: number;
  recentSpendLogs?: number;
  memory_logs_count?: number;
  filtered_count?: number;
}

const getTypeIcon = (type: string) => {
  switch (type.toLowerCase()) {
    case 'info':
      return <InfoCircleOutlined style={{ color: '#1890ff' }} />;
    case 'warn':
    case 'warning':
      return <WarningOutlined style={{ color: '#faad14' }} />;
    case 'error':
      return <CloseCircleOutlined style={{ color: '#ff4d4f' }} />;
    default:
      return <ClockCircleOutlined style={{ color: '#52c41a' }} />;
  }
};

const getTypeColor = (type: string) => {
  switch (type.toLowerCase()) {
    case 'info':
      return 'blue';
    case 'warn':
    case 'warning':
      return 'orange';
    case 'error':
      return 'red';
    case 'success':
      return 'green';
    default:
      return 'default';
  }
};

const columns = [
  {
    title: "Timestamp",
    dataIndex: "timestamp",
    key: "timestamp",
    render: (timestamp: string) => (
      <div>
        <div>{moment(timestamp).format('MMM DD, YYYY')}</div>
        <div style={{ fontSize: '12px', color: '#666' }}>
          {moment(timestamp).format('HH:mm:ss')}
        </div>
      </div>
    ),
    width: 140,
  },
  {
    title: "Type",
    dataIndex: "type",
    key: "type",
    render: (type: string) => (
      <Tag color={getTypeColor(type)} icon={getTypeIcon(type)}>
        {type.toUpperCase()}
      </Tag>
    ),
    width: 100,
  },
  {
    title: "Message",
    dataIndex: "message",
    key: "message",
    ellipsis: true,
    width: 300,
  },
  {
    title: "Metadata",
    dataIndex: "metadata",
    key: "metadata",
    render: (meta: Record<string, any>) => {
      if (!meta || Object.keys(meta).length === 0) return <Text>No metadata</Text>;

      return (
        <Collapse size="small" ghost>
          <Collapse.Panel header={`${Object.keys(meta).length} fields`} key="1">
            <pre style={{ fontSize: '12px', margin: 0, backgroundColor: '#f5f5f5', padding: '8px', borderRadius: '4px' }}>
              {JSON.stringify(meta, null, 2)}
            </pre>
          </Collapse.Panel>
        </Collapse>
      );
    },
    width: 200,
  },
];

const MetricsTable: React.FC = () => {
  const [logs, setLogs] = useState<ObservabilityLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<MetricsStats>({ totalLogs: 0, byType: {}, recentActivity: 0 });

  const calculateStats = (logsData: ObservabilityLog[]): MetricsStats => {
    const byType = logsData.reduce((acc, log) => {
      acc[log.type] = (acc[log.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const recentActivity = logsData.filter(log =>
      moment(log.timestamp).isAfter(moment().subtract(1, 'hour'))
    ).length;

    return {
      totalLogs: logsData.length,
      byType,
      recentActivity,
    };
  };

  const fetchDataWithAuth = async (endpoint: string, options: RequestInit = {}) => {
    const apiUrl = process.env.NODE_ENV === 'development'
      ? `http://localhost:8001${endpoint}`
      : endpoint;

    // Try to get auth token from localStorage or context
    const accessToken = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };

    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    const response = await fetch(apiUrl, {
      ...options,
      headers,
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Authentication required. Please log in.');
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        console.log('Fetching enhanced observability data from GET /api/observability/logs...');

        const data = await fetchDataWithAuth('/api/observability/logs?limit=100');
        console.log('Fetched enhanced observability data:', data);

        // Handle the new response structure
        const logsData = data.logs || data;
        const metadata = data.metadata || {};

        console.log('Processing logs:', logsData.length, 'entries');
        console.log('Metadata:', metadata);

        // Filter out any invalid entries
        const validLogs = (Array.isArray(logsData) ? logsData : []).filter((log: ObservabilityLog) =>
          log.timestamp && log.type && log.message
        );

        setLogs(validLogs);
        const calculatedStats = calculateStats(validLogs);

        // Enhance stats with metadata from the enhanced API
        const enhancedStats = {
          ...calculatedStats,
          ...metadata,
          recentModelsUsed: metadata.recent_models_used || [],
          totalRecentSpend: metadata.total_recent_spend || 0,
          recentSpendLogs: metadata.recent_spend_logs || 0
        };

        setStats(enhancedStats);
        console.log('Updated enhanced stats:', enhancedStats);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        console.error('Error fetching observability data:', errorMessage);
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Refresh every 15 seconds for better real-time experience
    const interval = setInterval(() => {
      console.log('Auto-refreshing enhanced observability data...');
      fetchData();
    }, 15000);

    return () => {
      console.log('Cleaning up observability data refresh interval');
      clearInterval(interval);
    };
  }, []);

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
      <Spin size="large" />
    </div>
  );

  if (error) return <Alert type="error" message={error} showIcon />;

  // Prepare chart data
  const chartData = Object.entries(stats.byType).map(([type, count]) => ({
    name: type.charAt(0).toUpperCase() + type.slice(1),
    value: count,
  }));

  return (
    <div style={{ padding: '24px' }}>
      {/* Summary Cards */}
      <Grid numItems={1} numItemsSm={2} numItemsLg={4} className="gap-4 mb-6">
        <Card>
          <Text>Total Logs</Text>
          <Title>{stats.totalLogs.toLocaleString()}</Title>
          <Text className="text-sm text-gray-500 mt-1">
            {stats.totalLogs === 0 ? 'No data yet' : 'entries stored'}
            {stats.memory_logs_count && (
              <span className="block text-xs">({stats.memory_logs_count} in memory)</span>
            )}
          </Text>
        </Card>
        <Card>
          <Text>Recent Activity (1h)</Text>
          <Title>{stats.recentActivity.toLocaleString()}</Title>
          <Text className="text-sm text-gray-500 mt-1">
            {stats.recentActivity === 0 ? 'No recent activity' : 'logs in last hour'}
          </Text>
        </Card>
        <Card>
          <Text>Log Types</Text>
          <Title>{Object.keys(stats.byType).length}</Title>
          <Text className="text-sm text-gray-500 mt-1">
            {Object.keys(stats.byType).length === 0 ? 'No types yet' : 'different types'}
          </Text>
        </Card>
        <Card>
          <Text>Latest Log</Text>
          <Title className="text-sm">
            {logs.length > 0
              ? moment(logs[logs.length - 1]?.timestamp).fromNow()
              : 'No logs yet'
            }
          </Title>
          <Text className="text-sm text-gray-500 mt-1">
            {logs.length > 0 && `${logs[logs.length - 1]?.type}: ${logs[logs.length - 1]?.message.substring(0, 30)}...`}
          </Text>
        </Card>
      </Grid>

      {/* Enhanced Summary Cards - Show additional data from existing endpoints */}
      {(stats.recentSpendLogs || stats.totalRecentSpend || (stats.recentModelsUsed && stats.recentModelsUsed.length > 0)) && (
        <Grid numItems={1} numItemsSm={2} numItemsLg={3} className="gap-4 mb-6">
          {stats.recentSpendLogs && (
            <Card>
              <Text>Recent Spend Logs (24h)</Text>
              <Title>{stats.recentSpendLogs.toLocaleString()}</Title>
              <Text className="text-sm text-gray-500 mt-1">
                entries from spend tracking
              </Text>
            </Card>
          )}
          {stats.totalRecentSpend && (
            <Card>
              <Text>Total Recent Spend (24h)</Text>
              <Title>${stats.totalRecentSpend.toFixed(4)}</Title>
              <Text className="text-sm text-gray-500 mt-1">
                from integrated spend logs
              </Text>
            </Card>
          )}
          {stats.recentModelsUsed && stats.recentModelsUsed.length > 0 && (
            <Card>
              <Text>Recent Models (24h)</Text>
              <Title>{stats.recentModelsUsed.length}</Title>
              <Text className="text-sm text-gray-500 mt-1">
                {stats.recentModelsUsed.slice(0, 2).join(', ')}
                {stats.recentModelsUsed.length > 2 && '...'}
              </Text>
            </Card>
          )}
        </Grid>
      )}

      {/* Charts */}
      {chartData.length > 0 && (
        <div style={{ marginBottom: '24px' }}>
          <Grid numItems={1} numItemsSm={2} className="gap-4">
            <Card>
              <Title>Log Distribution by Type</Title>
              <DonutChart
                data={chartData}
                category="value"
                index="name"
                colors={["blue", "orange", "red", "green", "purple"]}
                className="mt-6"
              />
            </Card>
            <Card>
              <Title>Log Counts by Type</Title>
              <BarChart
                data={chartData}
                index="name"
                categories={["value"]}
                colors={["blue"]}
                yAxisWidth={48}
                className="mt-6"
              />
            </Card>
          </Grid>
        </div>
      )}

      {/* Logs Table */}
      <AntCard
        title={`Observability Logs (${stats.totalLogs})`}
        extra={
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <Badge count={stats.recentActivity} showZero style={{ backgroundColor: '#52c41a' }}>
              <span style={{ marginRight: '8px', fontSize: '12px' }}>Recent Activity</span>
            </Badge>
            <span style={{ fontSize: '12px', color: '#666' }}>Auto-refresh: 15s</span>
          </div>
        }
      >
        <Table
          columns={columns}
          dataSource={logs.slice().reverse()} // Show newest first
          rowKey={(row, index) => `${row.timestamp}-${row.message}-${index}`}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            pageSizeOptions: ['5', '10', '20', '50'],
            showTotal: (total, range) => {
              if (total === 0) return 'No logs found - try sending data via POST /api/observability/logs';
              return `Showing ${range[0]}-${range[1]} of ${total} logs`;
            },
          }}
          size="small"
          scroll={{ x: 800 }}
          locale={{
            emptyText: (
              <div style={{ padding: '20px', textAlign: 'center' }}>
                <Text>No observability data found</Text>
                <div style={{ marginTop: '8px', fontSize: '12px', color: '#666' }}>
                  Send data using: POST /api/observability/logs
                </div>
              </div>
            )
          }}
        />
      </AntCard>
    </div>
  );
};

export default MetricsTable;
