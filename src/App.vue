<template>
  <div class="app-shell">
    <header class="topbar">
      <div>
        <p class="eyebrow">Real-Time Analytics</p>
        <h1>Realtime Data Visualization Platform</h1>
        <p class="subtitle">Live monitoring, anomaly detection, and interactive insights for modern operations.</p>
      </div>
      <div class="topbar-actions">
        <div class="status-chip" :class="store.connected ? 'online' : 'offline'">
          <span />
          {{ store.connected ? 'Connected' : 'Reconnecting' }}
        </div>
        <button class="text-button" @click="store.toggleStreaming()">
          {{ store.streaming ? 'Pause Stream' : 'Resume Stream' }}
        </button>
      </div>
    </header>

    <section class="control-panel">
      <div class="control-group">
        <p class="control-label">Time range</p>
        <div class="range-buttons">
          <button
            v-for="range in ranges"
            :key="range"
            :class="{ active: store.timeRange === range }"
            @click="store.setRange(range)">
            {{ labels[range] }}
          </button>
        </div>
      </div>

      <div class="control-group">
        <p class="control-label">Metric toggles</p>
        <div class="toggle-buttons">
          <button
            :class="{ active: store.activeSeries.cpu }"
            @click="store.toggleSeries('cpu')">
            CPU
          </button>
          <button
            :class="{ active: store.activeSeries.memory }"
            @click="store.toggleSeries('memory')">
            Memory
          </button>
          <button
            :class="{ active: store.activeSeries.throughput }"
            @click="store.toggleSeries('throughput')">
            Throughput
          </button>
        </div>
      </div>

      <div class="control-group status-grid">
        <div class="status-panel">
          <span>Live status</span>
          <strong>{{ store.streaming ? 'Streaming' : 'Paused' }}</strong>
        </div>
        <div class="status-panel">
          <span>Last update</span>
          <strong>{{ store.lastUpdateLabel }}</strong>
        </div>
        <div class="status-panel">
          <span>Event feed</span>
          <strong>{{ feedCount }} items</strong>
        </div>
      </div>
    </section>

    <section class="overview-grid">
      <MetricCard
        title="CPU utilization"
        :value="formatPercent(store.summary.cpu)"
        description="Current CPU load"
        accent="cpu"
      />
      <MetricCard
        title="Memory usage"
        :value="formatPercent(store.summary.memory)"
        description="Current memory consumption"
        accent="memory"
      />
      <MetricCard
        title="Throughput"
        :value="formatNumber(store.summary.throughput)"
        unit="req/s"
        description="Request rate per second"
        accent="throughput"
      />
      <MetricCard
        title="Alerts"
        :value="store.summary.errors.toString()"
        description="Critical events in feed"
        accent="alert"
      />
    </section>

    <section class="dashboard-grid">
      <RealtimeChart
        title="CPU / Memory Trends"
        chart-type="line"
        :points="store.filteredPoints"
        :active-series="store.activeSeries"
        :series-keys="['cpu', 'memory']"
        :labels="{ cpu: 'CPU', memory: 'Memory' }"
      />

      <RealtimeChart
        title="Throughput History"
        chart-type="area"
        :points="store.filteredPoints"
        :active-series="store.activeSeries"
        :series-keys="['throughput']"
        :labels="{ throughput: 'Throughput' }"
      />

      <SeverityBarChart
        title="Event Severity Distribution"
        :activity-feed="store.activityFeed"
      />
    </section>

    <section class="feed-panel">
      <div class="feed-header">
        <div>
          <h2>Live Activity Feed</h2>
          <p>Newest events appear first. Stream updates are appended automatically.</p>
        </div>
        <div class="toggle-row">
          <label>
            <input type="checkbox" v-model="store.autoScroll" /> Auto-scroll
          </label>
          <button class="text-button" @click="store.setAutoScroll(!store.autoScroll)">
            {{ store.autoScroll ? 'Disable' : 'Enable' }} auto-scroll
          </button>
        </div>
      </div>

      <ActivityFeed :feed="store.activityFeed" :auto-scroll="store.autoScroll" />
    </section>

    <aside class="footer-panel">
      <p class="footer-note">Data simulated in-browser. The platform includes safe payload handling, reconnect retry state, and efficient chart updates.</p>
      <div class="footer-tags">
        <span>TypeScript</span>
        <span>Vue 3</span>
        <span>Pinia</span>
        <span>ECharts</span>
        <span>Real-time</span>
      </div>
    </aside>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useDashboardStore } from './stores/dashboard';
import { useRealtimeSimulator } from './composables/useRealtimeSimulator';
import MetricCard from './components/MetricCard.vue';
import RealtimeChart from './components/RealtimeChart.vue';
import SeverityBarChart from './components/SeverityBarChart.vue';
import ActivityFeed from './components/ActivityFeed.vue';

const store = useDashboardStore();
useRealtimeSimulator();

const labels = {
  '1m': '1 min',
  '5m': '5 min',
  '30m': '30 min',
  '1h': '1 hour',
};

const ranges = ['1m', '5m', '30m', '1h'] as const;

const feedCount = computed(() => store.activityFeed.length);

const formatPercent = (value: number) => `${value.toFixed(1)}%`;
const formatNumber = (value: number) => value.toLocaleString(undefined, { maximumFractionDigits: 0 });
</script>
