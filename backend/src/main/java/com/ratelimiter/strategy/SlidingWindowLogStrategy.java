package com.ratelimiter.strategy;

import com.ratelimiter.dto.RateLimiterState;
import org.springframework.stereotype.Component;

import java.util.*;
import java.util.concurrent.ConcurrentLinkedDeque;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Sliding Window Log Algorithm:
 * - Stores timestamps of all requests within the window
 * - When a new request arrives, remove all entries older than windowSizeMs
 * - Accept if remaining count < maxRequests
 * - Most accurate but highest memory usage
 */
@Component
public class SlidingWindowLogStrategy implements RateLimiterStrategy {

    private volatile int maxRequests = 10;
    private volatile long windowSizeMs = 10000; // 10 seconds
    private final LinkedList<Long> requestTimestamps = new LinkedList<>();
    private final AtomicInteger acceptedCount = new AtomicInteger(0);
    private final AtomicInteger rejectedCount = new AtomicInteger(0);
    private final ConcurrentLinkedDeque<RateLimiterState.RequestLogEntry> logs = new ConcurrentLinkedDeque<>();

    @Override
    public synchronized RateLimiterState tryAcquire(String username) {
        long now = System.currentTimeMillis();
        removeExpired(now);

        boolean accepted;
        if (requestTimestamps.size() < maxRequests) {
            requestTimestamps.add(now);
            accepted = true;
            acceptedCount.incrementAndGet();
        } else {
            accepted = false;
            rejectedCount.incrementAndGet();
        }

        RateLimiterState.RequestLogEntry log = RateLimiterState.RequestLogEntry.builder()
                .timestamp(now)
                .accepted(accepted)
                .username(username)
                .detail(String.format("Timestamps in window: %d/%d", requestTimestamps.size(), maxRequests))
                .build();
        logs.addFirst(log);
        while (logs.size() > 50) logs.removeLast();

        return buildState(accepted);
    }

    private void removeExpired(long now) {
        while (!requestTimestamps.isEmpty() && requestTimestamps.getFirst() < now - windowSizeMs) {
            requestTimestamps.removeFirst();
        }
    }

    @Override
    public synchronized RateLimiterState getState() {
        removeExpired(System.currentTimeMillis());
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
        requestTimestamps.clear();
    }

    @Override
    public synchronized void reset() {
        requestTimestamps.clear();
        acceptedCount.set(0);
        rejectedCount.set(0);
        logs.clear();
    }

    @Override
    public String getAlgorithmName() {
        return "sliding-window-log";
    }

    private RateLimiterState buildState(boolean accepted) {
        Map<String, Object> state = new LinkedHashMap<>();
        state.put("currentCount", requestTimestamps.size());
        state.put("maxRequests", maxRequests);
        state.put("windowSizeMs", windowSizeMs);
        // Send normalized timestamps for timeline visualization
        long now = System.currentTimeMillis();
        List<Double> normalizedTimestamps = new ArrayList<>();
        for (Long ts : requestTimestamps) {
            normalizedTimestamps.add((now - ts) / 1000.0); // seconds ago
        }
        state.put("timestamps", normalizedTimestamps);

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
