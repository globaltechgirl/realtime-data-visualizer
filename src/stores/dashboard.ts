import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import type { ActivityEntry, DashboardState, MetricPoint, TimeRange } from '../types';

const rangeMs: Record<TimeRange, number> = {
  '1m': 60_000,
  '5m': 300_000,
  '30m': 1_800_000,
  '1h': 3_600_000,
};

export const useDashboardStore = defineStore('dashboard', () => {
  const streaming = ref(true);
  const connected = ref(true);
  const timeRange = ref<TimeRange>('5m');
  const autoScroll = ref(true);
  const activeSeries = ref({ cpu: true, memory: true, throughput: true });
  const dataPoints = ref<MetricPoint[]>([]);
  const activityFeed = ref<ActivityEntry[]>([]);
  const lastUpdateLabel = ref('Idle');
  const errorMessage = ref<string | null>(null);

  const filteredPoints = computed(() => {
    const cutoff = Date.now() - rangeMs[timeRange.value];
    return dataPoints.value.filter((point) => point.timestamp >= cutoff);
  });

  const summary = computed(() => {
    const points = filteredPoints.value;
    if (!points.length) {
      return {
        cpu: 0,
        memory: 0,
        throughput: 0,
        errors: 0,
      };
    }
    const latest = points[points.length - 1];
    const errors = activityFeed.value.filter((entry) => entry.severity === 'critical').length;
    return {
      cpu: latest.cpu,
      memory: latest.memory,
      throughput: latest.throughput,
      errors,
    };
  });

  function addDataPoint(point: MetricPoint) {
    dataPoints.value.push(point);
    if (dataPoints.value.length > 240) {
      dataPoints.value.splice(0, dataPoints.value.length - 240);
    }
    lastUpdateLabel.value = new Date(point.timestamp).toLocaleTimeString();
  }

  function addActivity(entry: ActivityEntry) {
    activityFeed.value.unshift(entry);
    if (activityFeed.value.length > 120) {
      activityFeed.value.splice(120);
    }
  }

  function setRange(range: TimeRange) {
    timeRange.value = range;
  }

  function toggleStreaming() {
    streaming.value = !streaming.value;
    if (streaming.value) {
      errorMessage.value = null;
    }
  }

  function setConnected(value: boolean) {
    connected.value = value;
  }

  function setError(message: string | null) {
    errorMessage.value = message;
  }

  function toggleSeries(series: keyof DashboardState['activeSeries']) {
    activeSeries.value[series] = !activeSeries.value[series];
  }

  function setAutoScroll(value: boolean) {
    autoScroll.value = value;
  }

  return {
    streaming,
    connected,
    timeRange,
    autoScroll,
    activeSeries,
    dataPoints,
    activityFeed,
    lastUpdateLabel,
    errorMessage,
    filteredPoints,
    summary,
    addDataPoint,
    addActivity,
    setRange,
    toggleStreaming,
    toggleSeries,
    setAutoScroll,
    setConnected,
    setError,
  };
});
