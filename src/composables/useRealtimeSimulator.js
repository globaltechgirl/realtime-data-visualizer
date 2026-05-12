import { watch, onBeforeUnmount } from 'vue';
import { useDashboardStore } from '../stores/dashboard';
const clamp = (value, min, max) => Math.max(min, Math.min(value, max));
const makeEvent = (data) => {
    const severity = data.errorRate > 0.7 ? 'critical' : data.errorRate > 0.45 ? 'warning' : 'info';
    const type = severity === 'critical' ? 'alert' : 'transaction';
    return {
        id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        timestamp: Date.now(),
        type,
        severity,
        message: severity === 'critical'
            ? `Spike detected: ${Math.round(data.errorRate * 100)}% anomaly score`
            : `Telemetry updated: CPU ${data.cpu.toFixed(1)}%, Memory ${data.memory.toFixed(1)}%`,
    };
};
const randomWalk = (value, volatility, min, max) => {
    const delta = (Math.random() * 2 - 1) * volatility;
    return clamp(value + delta, min, max);
};
export function useRealtimeSimulator() {
    const store = useDashboardStore();
    let intervalId = null;
    let lastPoint = {
        timestamp: Date.now() - 1000,
        cpu: 35,
        memory: 45,
        throughput: 650,
        errorRate: 0.12,
    };
    let failureBackoff = 0;
    const step = () => {
        if (!store.streaming) {
            return;
        }
        const now = Date.now();
        const next = {
            timestamp: now,
            cpu: randomWalk(lastPoint.cpu, 2.2, 15, 98),
            memory: randomWalk(lastPoint.memory, 1.5, 25, 96),
            throughput: randomWalk(lastPoint.throughput, 25, 200, 1200),
            errorRate: randomWalk(lastPoint.errorRate, 0.06, 0, 0.92),
        };
        lastPoint = next;
        if (Math.random() < 0.03) {
            store.setError('Stream interrupted. Retrying...');
            store.setConnected(false);
            if (intervalId !== null) {
                window.clearInterval(intervalId);
                intervalId = null;
            }
            failureBackoff = Math.min(60000, failureBackoff + 5000);
            window.setTimeout(() => {
                store.setConnected(true);
                store.setError(null);
                failureBackoff = 0;
                start();
            }, failureBackoff || 2000);
            return;
        }
        store.addDataPoint(next);
        store.addActivity(makeEvent(next));
    };
    const start = () => {
        if (intervalId !== null) {
            return;
        }
        store.setConnected(true);
        intervalId = window.setInterval(() => {
            step();
        }, 1000);
    };
    const stop = () => {
        if (intervalId !== null) {
            window.clearInterval(intervalId);
            intervalId = null;
        }
    };
    watch(() => store.streaming, (streaming) => {
        if (streaming) {
            start();
        }
        else {
            stop();
        }
    }, { immediate: true });
    onBeforeUnmount(() => {
        stop();
    });
    return {
        start,
        stop,
    };
}
//# sourceMappingURL=useRealtimeSimulator.js.map