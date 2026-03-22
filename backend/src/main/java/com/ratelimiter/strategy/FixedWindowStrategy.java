package com.ratelimiter.strategy;

import com.ratelimiter.dto.RateLimiterState;
import org.springframework.stereotype.Component;

import java.util.*;
import java.util.concurrent.ConcurrentLinkedDeque;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Fixed Window Counter Algorithm:
 * - Time is divided into fixed windows of 'windowSizeMs' duration
 * - Each window allows 'maxRequests' requests
 * - Counter resets at the start of each new window
 */
@Component
public class FixedWindowStrategy implements RateLimiterStrategy {

    private volatile int maxRequests = 10;
    private volatile long windowSizeMs = 10000; // 10 seconds
    private volatile long windowStart;
    private volatile int currentCount = 0;
    private final AtomicInteger acceptedCount = new AtomicInteger(0);
    private final AtomicInteger rejectedCount = new AtomicInteger(0);
    private final ConcurrentLinkedDeque<RateLimiterState.RequestLogEntry> logs = new ConcurrentLinkedDeque<>();

    public FixedWindowStrategy() {
        this.windowStart = System.currentTimeMillis();
    }

    @Override
    public synchronized RateLimiterState tryAcquire(String username) {
        checkWindow();
        boolean accepted;
        if (currentCount < maxRequests) {
            currentCount++;
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
                .detail(String.format("Count: %d/%d | Window: %.1fs remaining",
                        currentCount, maxRequests,
                        (windowStart + windowSizeMs - System.currentTimeMillis()) / 1000.0))
                .build();
        logs.addFirst(log);
        while (logs.size() > 50) logs.removeLast();

        return buildState(accepted);
    }

    private void checkWindow() {
        long now = System.currentTimeMillis();
        if (now - windowStart >= windowSizeMs) {
            windowStart = now;
            currentCount = 0;
        }
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
        windowStart = System.currentTimeMillis();
        currentCount = 0;
    }

    @Override
    public synchronized void reset() {
        windowStart = System.currentTimeMillis();
        currentCount = 0;
        acceptedCount.set(0);
        rejectedCount.set(0);
        logs.clear();
    }

    @Override
    public String getAlgorithmName() {
        return "fixed-window";
    }

    private RateLimiterState buildState(boolean accepted) {
        Map<String, Object> state = new LinkedHashMap<>();
        state.put("currentCount", currentCount);
        state.put("maxRequests", maxRequests);
        state.put("windowSizeMs", windowSizeMs);
        state.put("windowStart", windowStart);
        state.put("windowElapsedMs", System.currentTimeMillis() - windowStart);

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
