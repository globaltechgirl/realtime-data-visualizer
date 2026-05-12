<template>
  <section class="chart-card">
    <div class="chart-header">
      <div>
        <h3>{{ title }}</h3>
        <p>Streaming updates refresh the chart continuously while connected.</p>
      </div>
      <span class="badge">{{ chartTypeLabel }}</span>
    </div>
    <div class="chart-wrapper" ref="chartRef">
      <div v-if="!hasSeries" class="chart-empty">
        <p>No active metrics available. Toggle series to view chart data.</p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount, type PropType } from 'vue';
import * as echarts from 'echarts';
import type { MetricPoint } from '../types';

type SeriesKey = 'cpu' | 'memory' | 'throughput';

const props = defineProps({
  title: String,
  chartType: { type: String as PropType<'line' | 'area'>, default: 'line' },
  points: { type: Array as PropType<MetricPoint[]>, default: () => [] as MetricPoint[] },
  activeSeries: { type: Object as PropType<Record<SeriesKey, boolean>>, required: true },
  seriesKeys: { type: Array as PropType<SeriesKey[]>, required: true },
  labels: { type: Object as PropType<Partial<Record<SeriesKey, string>>>, required: true },
});

const chartRef = ref<HTMLElement | null>(null);
let chart: echarts.ECharts | null = null;

const colorMap: Record<SeriesKey, string> = {
  cpu: '#7c8df4',
  memory: '#4fd1c5',
  throughput: '#ffb020',
};

const hasSeries = computed(() => props.seriesKeys.some((key: SeriesKey) => props.activeSeries[key]));
const chartTypeLabel = computed(() => props.chartType === 'area' ? 'Area' : 'Line');

const categories = computed(() => props.points.map((point: MetricPoint) => new Date(point.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })));

const seriesData = computed(() =>
  props.seriesKeys
    .filter((key: SeriesKey) => props.activeSeries[key])
    .map((key: SeriesKey) => ({
      name: props.labels[key] ?? key,
      type: 'line',
      smooth: true,
      emphasis: { focus: 'series' },
      symbol: 'circle',
      symbolSize: 6,
      showSymbol: false,
      lineStyle: {
        width: 3,
      },
      areaStyle: props.chartType === 'area' ? { opacity: 0.35 } : undefined,
      itemStyle: {
        color: colorMap[key],
      },
      data: props.points.map((point: MetricPoint) => Number(point[key].toFixed(2))),
    }))
);

const buildOptions = () => ({
  animation: true,
  animationDuration: 500,
  grid: {
    left: 12,
    right: 16,
    top: 20,
    bottom: 18,
  },
  tooltip: {
    trigger: 'axis',
    backgroundColor: 'rgba(12, 19, 35, 0.96)',
    borderColor: '#1f2a4b',
    textStyle: { color: '#fff' },
    axisPointer: { type: 'shadow' },
  },
  legend: {
    show: false,
  },
  xAxis: {
    type: 'category',
    data: categories.value,
    boundaryGap: false,
    axisLine: { lineStyle: { color: 'rgba(255,255,255,0.16)' } },
    axisTick: { show: false },
    axisLabel: { color: '#9aa8cd', fontSize: 11, rotate: 0 },
  },
  yAxis: {
    type: 'value',
    splitLine: { lineStyle: { color: 'rgba(255,255,255,0.06)' } },
    axisLine: { show: false },
    axisTick: { show: false },
    axisLabel: { color: '#9aa8cd' },
  },
  series: seriesData.value,
});

const updateChart = () => {
  if (!chart) return;
  if (!hasSeries.value) {
    chart.clear();
    return;
  }
  chart.setOption(buildOptions(), { notMerge: true });
};

const resize = () => {
  chart?.resize();
};

onMounted(() => {
  if (!chartRef.value) return;
  chart = echarts.init(chartRef.value, undefined, { renderer: 'canvas' });
  updateChart();
  window.addEventListener('resize', resize);
});

watch([() => props.points, hasSeries], updateChart, { deep: true });

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
  max-width: 360px;
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
  position: relative;
  flex: 1;
  min-height: 260px;
}

.chart-empty {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  color: rgba(255, 255, 255, 0.68);
  padding: 24px;
  text-align: center;
}
</style>
