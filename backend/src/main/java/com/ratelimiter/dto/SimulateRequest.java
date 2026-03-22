package com.ratelimiter.dto;

import lombok.*;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SimulateRequest {
    private String algorithmName;
    private int count; // number of requests to simulate (burst)
}
