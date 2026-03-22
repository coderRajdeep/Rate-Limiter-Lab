package com.ratelimiter.strategy;

import com.ratelimiter.dto.RateLimiterState;
import org.springframework.stereotype.Component;

import java.util.*;
import java.util.concurrent.ConcurrentLinkedDeque;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Sliding Window Counter Algorithm:
 * - Combines Fixed Window + Sliding Window Log approach
 * - Maintains current window count and previous window count
 * - Uses weighted calculation:
 *   effectiveCount = prevCount * (1 - elapsedRatio) + currentCount
 * - More memory efficient than log-based approach
 */
@Component
public class SlidingWindowCounterStrategy implements RateLimiterStrategy {

    private volatile int maxRequests = 10;
    private volatile long windowSizeMs = 10000; // 10 seconds
    private volatile long currentWindowStart;
    private volatile int currentWindowCount = 0;
    private volatile int previousWindowCount = 0;
    private final AtomicInteger acceptedCount = new AtomicInteger(0);
    private final AtomicInteger rejectedCount = new AtomicInteger(0);
    private final ConcurrentLinkedDeque<RateLimiterState.RequestLogEntry> logs = new ConcurrentLinkedDeque<>();

    public SlidingWindowCounterStrategy() {
        this.currentWindowStart = System.currentTimeMillis();
    }

    @Override
    public synchronized RateLimiterState tryAcquire(String username) {
        checkWindow();
        double effectiveCount = getEffectiveCount();
        boolean accepted;

        if (effectiveCount < maxRequests) {
            currentWindowCount++;
            accepted = true;
            acceptedCount.incrementAndGet();
        } else {
            accepted = false;
            rejectedCount.incrementAndGet();
        }

        RateLimiterState.RequestLogEntry log = RateLimiterState.RequestLogEntry.builder()
                .timestamp(System.currentTimeMillis())
                .accepted(accepted)
                .username(username)
                .detail(String.format("Effective: %.1f/%d (prev=%d, curr=%d)",
                        getEffectiveCount(), maxRequests, previousWindowCount, currentWindowCount))
                .build();
        logs.addFirst(log);
        while (logs.size() > 50) logs.removeLast();

        return buildState(accepted);
    }

    private void checkWindow() {
        long now = System.currentTimeMillis();
        long elapsed = now - currentWindowStart;
        if (elapsed >= windowSizeMs) {
            long windowsPassed = elapsed / windowSizeMs;
            if (windowsPassed == 1) {
                previousWindowCount = currentWindowCount;
            } else {
                previousWindowCount = 0;
            }
            currentWindowCount = 0;
            currentWindowStart = currentWindowStart + (windowsPassed * windowSizeMs);
        }
    }

    private double getEffectiveCount() {
        long elapsed = System.currentTimeMillis() - currentWindowStart;
        double elapsedRatio = Math.min(1.0, (double) elapsed / windowSizeMs);
        return previousWindowCount * (1.0 - elapsedRatio) + currentWindowCount;
    }

    @Override
    public synchronized RateLimiterState getState() {
        checkWindow();
        return buildState(false);
    }

    @Override
    public synchronized void updateConfig(Map<String, Object> config) {
        if (config.containsKey("maxRequests")) {
            maxRequests = ((Number) config.get("maxRequests")).intValue();
        }
        if (config.containsKey("windowSizeMs")) {
            windowSizeMs = ((Number) config.get("windowSizeMs")).longValue();
        }
        currentWindowStart = System.currentTimeMillis();
        currentWindowCount = 0;
        previousWindowCount = 0;
    }

    @Override
    public synchronized void reset() {
        currentWindowStart = System.currentTimeMillis();
        currentWindowCount = 0;
        previousWindowCount = 0;
        acceptedCount.set(0);
        rejectedCount.set(0);
        logs.clear();
    }

    @Override
    public String getAlgorithmName() {
        return "sliding-window-counter";
    }

    private RateLimiterState buildState(boolean accepted) {
        Map<String, Object> state = new LinkedHashMap<>();
        state.put("currentWindowCount", currentWindowCount);
        state.put("previousWindowCount", previousWindowCount);
        state.put("effectiveCount", Math.round(getEffectiveCount() * 10.0) / 10.0);
        state.put("maxRequests", maxRequests);
        state.put("windowSizeMs", windowSizeMs);
        state.put("windowStart", currentWindowStart);
        state.put("windowElapsedMs", System.currentTimeMillis() - currentWindowStart);

        return RateLimiterState.builder()
                .algorithmName(getAlgorithmName())
                .accepted(accepted)
                .acceptedCount(acceptedCount.get())
                .rejectedCount(rejectedCount.get())
                .totalRequests(acceptedCount.get() + rejectedCount.get())
                .algorithmState(state)
                .recentLogs(new ArrayList<>(logs))
                .timestamp(System.currentTimeMillis())
                .build();
    }
}
