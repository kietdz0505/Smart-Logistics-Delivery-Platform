package com.smart.logistic.dto;

import lombok.Data;

@Data
public class DriverLocationRequest {
    private String driverId;
    private double latitude;
    private double longitude;
    private String orderId;
    private double maxRadius;
}