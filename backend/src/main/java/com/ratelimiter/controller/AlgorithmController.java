package com.ratelimiter.controller;

import com.ratelimiter.dto.*;
import com.ratelimiter.service.RateLimiterService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class AlgorithmController {

    private final RateLimiterService rateLimiterService;

    @GetMapping("/algorithms")
    public ResponseEntity<List<Map<String, Object>>> getAlgorithms() {
        return ResponseEntity.ok(rateLimiterService.getAlgorithmList());
    }

    @PostMapping("/simulate-request")
    public ResponseEntity<List<RateLimiterState>> simulateRequest(
            @RequestBody SimulateRequest request, Authentication auth) {
        String username = auth != null ? auth.getName() : "anonymous";
        int count = Math.max(1, Math.min(request.getCount(), 50)); // cap burst at 50
        List<RateLimiterState> results = rateLimiterService.simulateRequests(
                request.getAlgorithmName(), count, username);
        return ResponseEntity.ok(results);
    }

    @PostMapping("/update-config")
    public ResponseEntity<RateLimiterState> updateConfig(@RequestBody ConfigUpdateRequest request) {
        rateLimiterService.updateConfig(request.getAlgorithmName(), request.getParameters());
        return ResponseEntity.ok(rateLimiterService.getState(request.getAlgorithmName()));
    }

    @PostMapping("/reset/{algorithmName}")
    public ResponseEntity<RateLimiterState> reset(@PathVariable String algorithmName) {
        rateLimiterService.resetAlgorithm(algorithmName);
        return ResponseEntity.ok(rateLimiterService.getState(algorithmName));
    }

    @GetMapping("/state/{algorithmName}")
    public ResponseEntity<RateLimiterState> getState(@PathVariable String algorithmName) {
        return ResponseEntity.ok(rateLimiterService.getState(algorithmName));
    }
}
