# Realtime Data Visualizer

A Vue 3 real-time analytics dashboard that simulates live telemetry, visualizes high-frequency metrics, and provides interactive controls for monitoring operations.

## Features

- Live streaming simulation with auto-reconnect and failure backoff
- Real-time line, area, and bar charts using `echarts`
- Metric cards with current values and time range controls
- Activity feed with newest-first updates and severity display
- Toggleable metric series and responsive layout
- Centralized state management with `pinia`
- Safe cleanup of intervals and chart listeners

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the dev server:
   ```bash
   npm run dev
   ```
3. Build for production:
   ```bash
   npm run build
   ```

## Architecture

- `src/App.vue` contains the main dashboard layout and control panel.
- `src/stores/dashboard.ts` manages application state, filtered time range data, and activity feed.
- `src/composables/useRealtimeSimulator.ts` generates live metrics and simulates stream interruptions, reconnects, and payload validation.
- Reusable chart components live in `src/components/`:
  - `RealtimeChart.vue` for line/area visualizations
  - `SeverityBarChart.vue` for event severity distribution
  - `MetricCard.vue` for KPI summary tiles
  - `ActivityFeed.vue` for live event logs

## State Management Strategy

- `pinia` holds app state in one centralized store.
- Computed values (`filteredPoints`, `summary`) derive visible data efficiently without repeated recalculation.
- UI controls mutate store state directly, and charts consume reactive props.

## Rendering Optimization Decisions

- `echarts` is used to minimize DOM churn and render smoothly on continuous updates.
- Charts are updated with `chart.setOption` and only re-render when relevant props change.
- The activity feed is capped to avoid infinite memory growth.
- The simulator limits stored points to the latest 240 values.
- Cleanup hooks remove intervals and window listeners to prevent leaks.

## Data Streaming Approach

- The app uses a mocked in-browser streaming generator for real-time updates.
- A `setInterval` emits metric points each second and simulates transient disconnects.
- The stream uses a random walk for CPU, memory, throughput, and error rate.
- Event entries are added to a live log feed with severity categories.

## Trade-offs

- Using a browser-based simulator avoids backend complexity and allows offline demoing.
- `echarts` provides performant visual rendering, but adds dependency size compared to smaller chart libs.
- The live feed is intentionally capped for performance rather than storing full history.

## Notes

- The app is designed to be responsive across desktop and smaller screens.
- The current implementation focuses on frontend architecture, smooth streaming, and reusable components.
