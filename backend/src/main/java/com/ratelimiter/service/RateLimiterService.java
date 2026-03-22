package com.ratelimiter.service;

import com.ratelimiter.dto.RateLimiterState;
import com.ratelimiter.factory.RateLimiterFactory;
import com.ratelimiter.strategy.RateLimiterStrategy;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

/**
 * Central service coordinating rate limiter operations and WebSocket broadcasts.
 * Acts as the Singleton shared state manager + Observer pattern trigger.
 */
@Service
@RequiredArgsConstructor
public class RateLimiterService {

    private final RateLimiterFactory factory;
    private final SimpMessagingTemplate messagingTemplate;

    public List<RateLimiterState> simulateRequests(String algorithmName, int count, String username) {
        RateLimiterStrategy strategy = factory.getStrategy(algorithmName);
        List<RateLimiterState> results = new java.util.ArrayList<>();

        for (int i = 0; i < count; i++) {
            RateLimiterState state = strategy.tryAcquire(username);
            results.add(state);
        }

        // Broadcast the latest state to all connected clients
        RateLimiterState latestState = results.get(results.size() - 1);
        broadcastState(algorithmName, latestState);

        return results;
    }

    public RateLimiterState getState(String algorithmName) {
        return factory.getStrategy(algorithmName).getState();
    }

    public void updateConfig(String algorithmName, Map<String, Object> config) {
        RateLimiterStrategy strategy = factory.getStrategy(algorithmName);
        strategy.updateConfig(config);
        broadcastState(algorithmName, strategy.getState());
    }

    public void resetAlgorithm(String algorithmName) {
        RateLimiterStrategy strategy = factory.getStrategy(algorithmName);
        strategy.reset();
        broadcastState(algorithmName, strategy.getState());
    }

    public List<Map<String, Object>> getAlgorithmList() {
        return factory.getAlgorithmList();
    }

    private void broadcastState(String algorithmName, RateLimiterState state) {
        messagingTemplate.convertAndSend("/topic/state/" + algorithmName, state);
    }
}
