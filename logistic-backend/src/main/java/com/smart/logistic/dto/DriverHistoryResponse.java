package com.smart.logistic.dto;

import lombok.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class DriverHistoryResponse {

    private List<Map<String, Object>> content;

    private boolean empty;
    private boolean first;
    private boolean last;

    private int number;
    private int numberOfElements;
    private int size;

    private long totalElements;
    private int totalPages;

    private BigDecimal totalEarnings;
}