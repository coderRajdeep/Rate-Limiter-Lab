package com.ratelimiter.dto;

import lombok.*;
import java.util.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RateLimiterState {
    private String algorithmName;
    private boolean accepted;
    private int acceptedCount;
    private int rejectedCount;
    private int totalRequests;
    private Map<String, Object> algorithmState; // algorithm-specific state details
    private List<RequestLogEntry> recentLogs;
    private long timestamp;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class RequestLogEntry {
        private long timestamp;
        private boolean accepted;
        private String username;
        private String detail;
    }
}
