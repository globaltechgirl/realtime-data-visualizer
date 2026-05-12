<template>
  <div class="activity-feed" ref="feedSlot">
    <div v-if="!feed.length" class="empty-state">
      <p>No activity yet. Waiting for live events...</p>
    </div>
    <article v-for="entry in feed" :key="entry.id" class="feed-item">
      <div class="feed-meta">
        <span class="severity" :class="entry.severity">{{ entry.severity }}</span>
        <span class="feed-type">{{ formatType(entry.type) }}</span>
      </div>
      <p class="feed-message">{{ entry.message }}</p>
      <time>{{ formatTime(entry.timestamp) }}</time>
    </article>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount, type PropType } from 'vue';
import type { ActivityEntry } from '../types';

const props = defineProps({
  feed: { type: Array as PropType<ActivityEntry[]>, required: true },
  autoScroll: { type: Boolean, default: true },
});

const feedSlot = ref<HTMLElement | null>(null);

const formatTime = (value: number) => new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
const formatType = (value: ActivityEntry['type']) => value.replace(/^(.)/, (m) => m.toUpperCase());

const scrollToTop = () => {
  if (!feedSlot.value || !props.autoScroll) return;
  feedSlot.value.scrollTo({ top: 0, behavior: 'smooth' });
};

watch(
  () => props.feed.length,
  () => {
    scrollToTop();
  }
);

onMounted(() => {
  if (props.autoScroll) {
    scrollToTop();
  }
});

onBeforeUnmount(() => {
  // nothing to clean up for now
});
</script>

<style scoped>
.activity-feed {
  display: grid;
  gap: 14px;
  max-height: 520px;
  overflow-y: auto;
  padding-right: 6px;
}

.empty-state {
  min-height: 140px;
  display: grid;
  place-items: center;
  color: rgba(255, 255, 255, 0.55);
}

.feed-item {
  padding: 18px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.04);
  display: grid;
  gap: 8px;
}

.feed-meta {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  align-items: center;
}

.severity {
  padding: 6px 10px;
  border-radius: 999px;
  text-transform: uppercase;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.05em;
}

.severity.info {
  background: rgba(79, 194, 255, 0.16);
  color: #7fd3ff;
}

.severity.warning {
  background: rgba(255, 180, 86, 0.16);
  color: #ffd87a;
}

.severity.critical {
  background: rgba(255, 92, 147, 0.18);
  color: #ff9abb;
}

.feed-type {
  color: #aab8db;
  font-size: 0.92rem;
}

.feed-message {
  margin: 0;
  line-height: 1.7;
  color: rgba(255, 255, 255, 0.88);
}

time {
  color: rgba(255, 255, 255, 0.58);
  font-size: 0.88rem;
}
</style>
