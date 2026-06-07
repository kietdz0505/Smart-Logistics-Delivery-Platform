package com.smart.logistic.dto;

import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;

@Getter
@Setter
public class CreateOrderRequest {
    private String phone;

    private String senderName;
    private String senderPhone;
    private String receiverName;
    private String receiverPhone;

    private double pickupLongitude;
    private double pickupLatitude;
    private String pickupAddress;

    private double deliveryLongitude;
    private double deliveryLatitude;
    private String deliveryAddress;

    private BigDecimal distanceKm;
    private BigDecimal price;
}