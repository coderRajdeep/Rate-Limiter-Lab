package com.ratelimiter.strategy;

import com.ratelimiter.dto.RateLimiterState;
import org.springframework.stereotype.Component;

import java.util.*;
import java.util.concurrent.ConcurrentLinkedDeque;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Token Bucket Algorithm:
 * - Bucket holds up to 'capacity' tokens
 * - Tokens refill at 'refillRate' tokens per second
 * - Each request consumes 1 token
 * - Request accepted if tokens > 0, rejected otherwise
 */
@Component
public class TokenBucketStrategy implements RateLimiterStrategy {

    private volatile double tokens;
    private volatile int capacity = 10;
    private volatile double refillRate = 2.0; // tokens per second
    private volatile long lastRefillTime;
    private final AtomicInteger acceptedCount = new AtomicInteger(0);
    private final AtomicInteger rejectedCount = new AtomicInteger(0);
    private final ConcurrentLinkedDeque<RateLimiterState.RequestLogEntry> logs = new ConcurrentLinkedDeque<>();

    public TokenBucketStrategy() {
        this.tokens = capacity;
        this.lastRefillTime = System.currentTimeMillis();
    }

    @Override
    public synchronized RateLimiterState tryAcquire(String username) {
        refillTokens();
        boolean accepted;
        if (tokens >= 1) {
            tokens -= 1;
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
                .detail(String.format("Tokens: %.1f/%d", tokens, capacity))
                .build();
        logs.addFirst(log);
        while (logs.size() > 50) logs.removeLast();

        return buildState(accepted);
    }

    private void refillTokens() {
        long now = System.currentTimeMillis();
        double elapsed = (now - lastRefillTime) / 1000.0;
        tokens = Math.min(capacity, tokens + elapsed * refillRate);
        lastRefillTime = now;
    }

    @Override
    public synchronized RateLimiterState getState() {
        refillTokens();
        return buildState(false);
    }

    @Override
    public synchronized void updateConfig(Map<String, Object> config) {
        if (config.containsKey("capacity")) {
            capacity = ((Number) config.get("capacity")).intValue();
        }
        if (config.containsKey("refillRate")) {
            refillRate = ((Number) config.get("refillRate")).doubleValue();
        }
        tokens = Math.min(tokens, capacity);
        lastRefillTime = System.currentTimeMillis();
    }

    @Override
    public synchronized void reset() {
        tokens = capacity;
        lastRefillTime = System.currentTimeMillis();
        acceptedCount.set(0);
        rejectedCount.set(0);
        logs.clear();
    }

    @Override
    public String getAlgorithmName() {
        return "token-bucket";
    }

    private RateLimiterState buildState(boolean accepted) {
        Map<String, Object> state = new LinkedHashMap<>();
        state.put("tokens", Math.round(tokens * 10.0) / 10.0);
        state.put("capacity", capacity);
        state.put("refillRate", refillRate);

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
