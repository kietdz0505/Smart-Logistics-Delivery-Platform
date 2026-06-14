package com.smart.logistic.dto;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class AdminDashboardResponse {

    private long totalUsers;

    private long totalDrivers;

    private long pendingDrivers;

    private long totalOrders;

    private long pendingOrders;

    private long acceptedOrders;

    private long deliveringOrders;

    private long completedOrders;

    private long cancelledOrders;

    private long failedOrders;

    private BigDecimal totalRevenue;
}