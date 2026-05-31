package com.smart.logistic.dto;

import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;
import java.util.UUID;

@Getter
@Setter
public class TopUpRequest {
    private UUID userId;       // ID của khách hàng cần nạp tiền
    private BigDecimal amount; // Số tiền muốn nạp vào ví
}