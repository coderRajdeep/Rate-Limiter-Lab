package com.ratelimiter.strategy;

import com.ratelimiter.dto.RateLimiterState;
import org.springframework.stereotype.Component;

import java.util.*;
import java.util.concurrent.ConcurrentLinkedDeque;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Leaky Bucket Algorithm:
 * - Queue holds up to 'capacity' requests
 * - Requests leak (process) at constant 'leakRate' per second
 * - New requests added to bucket if not full
 * - Rejected if bucket is full
 */
@Component
public class LeakyBucketStrategy implements RateLimiterStrategy {

    private volatile int queueSize = 0;
    private volatile int capacity = 10;
    private volatile double leakRate = 2.0; // requests per second
    private volatile long lastLeakTime;
    private final AtomicInteger acceptedCount = new AtomicInteger(0);
    private final AtomicInteger rejectedCount = new AtomicInteger(0);
    private final AtomicInteger processedCount = new AtomicInteger(0);
    private final ConcurrentLinkedDeque<RateLimiterState.RequestLogEntry> logs = new ConcurrentLinkedDeque<>();

    public LeakyBucketStrategy() {
        this.lastLeakTime = System.currentTimeMillis();
    }

    @Override
    public synchronized RateLimiterState tryAcquire(String username) {
        leak();
        boolean accepted;
        if (queueSize < capacity) {
            queueSize++;
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
                .detail(String.format("Queue: %d/%d", queueSize, capacity))
                .build();
        logs.addFirst(log);
        while (logs.size() > 50) logs.removeLast();

        return buildState(accepted);
    }

    private void leak() {
        long now = System.currentTimeMillis();
        double elapsed = (now - lastLeakTime) / 1000.0;
        int leaked = (int) (elapsed * leakRate);
        if (leaked > 0) {
            processedCount.addAndGet(Math.min(leaked, queueSize));
            queueSize = Math.max(0, queueSize - leaked);
            lastLeakTime = now;
        }
    }

    @Override
    public synchronized RateLimiterState getState() {
        leak();
        return buildState(false);
    }

    @Override
    public synchronized void updateConfig(Map<String, Object> config) {
        if (config.containsKey("capacity")) {
            capacity = ((Number) config.get("capacity")).intValue();
        }
        if (config.containsKey("leakRate")) {
            leakRate = ((Number) config.get("leakRate")).doubleValue();
        }
        queueSize = Math.min(queueSize, capacity);
        lastLeakTime = System.currentTimeMillis();
    }

    @Override
    public synchronized void reset() {
        queueSize = 0;
        lastLeakTime = System.currentTimeMillis();
        acceptedCount.set(0);
        rejectedCount.set(0);
        processedCount.set(0);
        logs.clear();
    }

    @Override
    public String getAlgorithmName() {
        return "leaky-bucket";
    }

    private RateLimiterState buildState(boolean accepted) {
        Map<String, Object> state = new LinkedHashMap<>();
        state.put("queueSize", queueSize);
        state.put("capacity", capacity);
        state.put("leakRate", leakRate);
        state.put("processedCount", processedCount.get());

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
