export type TimeRange = '1m' | '5m' | '30m' | '1h';

export interface MetricPoint {
  timestamp: number;
  cpu: number;
  memory: number;
  throughput: number;
  errorRate: number;
}

export interface ActivityEntry {
  id: string;
  timestamp: number;
  type: 'alert' | 'transaction' | 'event';
  message: string;
  severity: 'info' | 'warning' | 'critical';
}

export interface DashboardState {
  streaming: boolean;
  connected: boolean;
  timeRange: TimeRange;
  autoScroll: boolean;
  activeSeries: {
    cpu: boolean;
    memory: boolean;
    throughput: boolean;
  };
  dataPoints: MetricPoint[];
  activityFeed: ActivityEntry[];
  lastUpdateLabel: string;
  errorMessage: string | null;
}
