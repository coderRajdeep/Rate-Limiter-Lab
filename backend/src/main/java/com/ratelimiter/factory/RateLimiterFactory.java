package com.ratelimiter.factory;

import com.ratelimiter.strategy.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import jakarta.annotation.PostConstruct;
import java.util.*;

/**
 * Factory Pattern: Returns the correct RateLimiterStrategy based on algorithm name.
 */
@Component
@RequiredArgsConstructor
public class RateLimiterFactory {

    private final List<RateLimiterStrategy> strategies;
    private final Map<String, RateLimiterStrategy> strategyMap = new HashMap<>();

    @PostConstruct
    public void init() {
        for (RateLimiterStrategy strategy : strategies) {
            strategyMap.put(strategy.getAlgorithmName(), strategy);
        }
    }

    public RateLimiterStrategy getStrategy(String algorithmName) {
        RateLimiterStrategy strategy = strategyMap.get(algorithmName);
        if (strategy == null) {
            throw new IllegalArgumentException("Unknown algorithm: " + algorithmName);
        }
        return strategy;
    }

    public List<Map<String, Object>> getAlgorithmList() {
        List<Map<String, Object>> list = new ArrayList<>();

        list.add(buildInfo("token-bucket", "Token Bucket",
                "Tokens refill at a constant rate. Each request consumes a token. Requests are rejected when the bucket is empty.",
                "🪣", Map.of("capacity", 10, "refillRate", 2.0)));

        list.add(buildInfo("leaky-bucket", "Leaky Bucket",
                "Requests queue in a bucket that leaks at a constant rate. Overflow is rejected.",
                "🚰", Map.of("capacity", 10, "leakRate", 2.0)));

        list.add(buildInfo("fixed-window", "Fixed Window Counter",
                "Simple counter that resets at fixed time intervals. Easy to implement but susceptible to burst at window boundaries.",
                "🪟", Map.of("maxRequests", 10, "windowSizeMs", 10000)));

        list.add(buildInfo("sliding-window-log", "Sliding Window Log",
                "Stores exact timestamps of requests. Most accurate but uses more memory.",
                "📜", Map.of("maxRequests", 10, "windowSizeMs", 10000)));

        list.add(buildInfo("sliding-window-counter", "Sliding Window Counter",
                "Weighted combination of current and previous window counts. Good balance of accuracy and efficiency.",
                "📊", Map.of("maxRequests", 10, "windowSizeMs", 10000)));

        return list;
    }

    private Map<String, Object> buildInfo(String name, String displayName, String description,
                                          String icon, Map<String, Object> defaultParams) {
        Map<String, Object> info = new LinkedHashMap<>();
        info.put("name", name);
        info.put("displayName", displayName);
        info.put("description", description);
        info.put("icon", icon);
        info.put("defaultParams", defaultParams);
        return info;
    }
}
