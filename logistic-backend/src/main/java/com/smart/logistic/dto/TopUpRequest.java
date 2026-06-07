package com.smart.logistic.dto;

import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;
import java.util.UUID;

@Getter
@Setter
public class TopUpRequest {
    private UUID userId;
    private BigDecimal amount;
}