package com.ratelimiter.dto;

import lombok.*;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ConfigUpdateRequest {
    private String algorithmName;
    private Map<String, Object> parameters;
}
