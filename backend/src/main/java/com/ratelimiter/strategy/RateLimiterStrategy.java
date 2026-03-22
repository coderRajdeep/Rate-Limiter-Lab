package com.ratelimiter.strategy;

import com.ratelimiter.dto.RateLimiterState;
import java.util.Map;

/**
 * Strategy interface for rate limiting algorithms.
 * Each implementation represents a different rate limiting approach.
 */
public interface RateLimiterStrategy {

    /**
     * Attempt to acquire permission for a request.
     * @param username the user making the request
     * @return the updated state including whether the request was accepted
     */
    RateLimiterState tryAcquire(String username);

    /**
     * Get the current state of this rate limiter.
     * @return the current state
     */
    RateLimiterState getState();

    /**
     * Update configuration parameters.
     * @param config map of parameter names to values
     */
    void updateConfig(Map<String, Object> config);

    /**
     * Reset the rate limiter to its initial state.
     */
    void reset();

    /**
     * Get the algorithm name.
     * @return name of the algorithm
     */
    String getAlgorithmName();
}
