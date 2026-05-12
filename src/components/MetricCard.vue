<template>
  <article class="metric-card" :data-accent="accent">
    <div class="card-header">
      <span>{{ title }}</span>
      <div class="indicator" :class="accent" />
    </div>
    <div class="value-row">
      <strong>{{ value }}</strong>
      <span v-if="unit">{{ unit }}</span>
    </div>
    <p class="description">{{ description }}</p>
  </article>
</template>

<script setup lang="ts">
import type { PropType } from 'vue';

const props = defineProps({
  title: String,
  value: String,
  unit: { type: String, default: '' },
  description: String,
  accent: { type: String as PropType<'cpu' | 'memory' | 'throughput' | 'alert'>, default: 'cpu' },
});
</script>

<style scoped>
.metric-card {
  padding: 20px;
  border-radius: 24px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.04), rgba(255, 255, 255, 0.02));
  border: 1px solid rgba(255, 255, 255, 0.06);
  display: grid;
  gap: 18px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #b8c1e7;
  font-size: 0.95rem;
}

.indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #6b7cfa;
}

.indicator.cpu {
  background: #6b7cfa;
}

.indicator.memory {
  background: #4fd1c5;
}

.indicator.throughput {
  background: #ffb020;
}

.indicator.alert {
  background: #ff5c93;
}

.value-row {
  display: flex;
  align-items: baseline;
  gap: 10px;
}

.value-row strong {
  font-size: 2rem;
  line-height: 1;
}

.description {
  margin: 0;
  color: rgba(255, 255, 255, 0.72);
  font-size: 0.95rem;
  line-height: 1.5;
}
</style>
