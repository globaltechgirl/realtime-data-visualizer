<template>
  <section class="chart-card">
    <div class="chart-header">
      <div>
        <h3>{{ title }}</h3>
        <p>Severity counts from the latest activity feed highlight incident distribution.</p>
      </div>
      <span class="badge">Bar</span>
    </div>
    <div class="chart-wrapper" ref="chartRef" />
  </section>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount, type PropType } from 'vue';
import * as echarts from 'echarts';
import type { ActivityEntry } from '../types';

type Severity = 'info' | 'warning' | 'critical';
const categories = ['info', 'warning', 'critical'] as const;

const props = defineProps({
  title: String,
  activityFeed: { type: Array as PropType<ActivityEntry[]>, default: () => [] as ActivityEntry[] },
});

const chartRef = ref<HTMLElement | null>(null);
let chart: echarts.ECharts | null = null;

const counts = computed(() => {
  const summary: Record<Severity, number> = { info: 0, warning: 0, critical: 0 };
  for (const item of props.activityFeed) {
    if (categories.includes(item.severity)) {
      summary[item.severity] += 1;
    }
  }
  return categories.map((key) => summary[key]);
});

const option = () => ({
  animation: true,
  animationDuration: 450,
  grid: { left: 14, right: 16, top: 20, bottom: 18 },
  tooltip: {
    trigger: 'axis',
    axisPointer: { type: 'shadow' },
    backgroundColor: 'rgba(12, 19, 35, 0.96)',
    textStyle: { color: '#fff' },
  },
  xAxis: {
    type: 'category',
    data: categories.map((key) => key.toUpperCase()),
    axisLine: { lineStyle: { color: 'rgba(255,255,255,0.16)' } },
    axisTick: { show: false },
    axisLabel: { color: '#9aa8cd' },
  },
  yAxis: {
    type: 'value',
    splitLine: { lineStyle: { color: 'rgba(255,255,255,0.06)' } },
    axisLine: { show: false },
    axisTick: { show: false },
    axisLabel: { color: '#9aa8cd' },
  },
  series: [
    {
      name: 'Events',
      type: 'bar',
      data: counts.value,
      itemStyle: {
        borderRadius: [8, 8, 0, 0],
        color: (params: any) => {
          if (params.dataIndex === 0) return '#7c8df4';
          if (params.dataIndex === 1) return '#ffb020';
          return '#ff5c93';
        },
      },
      barWidth: '48%',
      emphasis: { focus: 'series' },
    },
  ],
});

const resize = () => {
  chart?.resize();
};

const updateChart = () => {
  if (!chart) return;
  chart.setOption(option(), { notMerge: true });
};

onMounted(() => {
  if (!chartRef.value) return;
  chart = echarts.init(chartRef.value, undefined, { renderer: 'canvas' });
  updateChart();
  window.addEventListener('resize', resize);
});

watch(() => props.activityFeed.length, updateChart);

onBeforeUnmount(() => {
  window.removeEventListener('resize', resize);
  chart?.dispose();
});
</script>

<style scoped>
.chart-card {
  min-height: 320px;
  border-radius: 24px;
  background: rgba(15, 21, 38, 0.96);
  border: 1px solid rgba(255, 255, 255, 0.05);
  display: grid;
  gap: 16px;
  padding: 22px;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
}

.chart-header h3 {
  margin: 0;
  font-size: 1.05rem;
}

.chart-header p {
  margin: 6px 0 0;
  color: rgba(255, 255, 255, 0.68);
  font-size: 0.95rem;
  max-width: 320px;
}

.badge {
  padding: 8px 14px;
  border-radius: 999px;
  color: #dfecff;
  background: rgba(92, 124, 250, 0.16);
  font-size: 0.82rem;
  font-weight: 700;
}

.chart-wrapper {
  min-height: 258px;
}
</style>
