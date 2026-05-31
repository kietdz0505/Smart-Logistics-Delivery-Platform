package com.smart.logistic.dto;

import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
public class OrderResponse {
    private UUID id;
    private String senderName;
    private String senderPhone;
    private String receiverName;
    private String receiverPhone;

    // Trả về số thực thuần túy cho Frontend dễ dùng
    private double pickupLongitude;
    private double pickupLatitude;
    private String pickupAddress;

    private double deliveryLongitude;
    private double deliveryLatitude;
    private String deliveryAddress;

    private BigDecimal distanceKm;
    private BigDecimal price;
    private String status;
    private LocalDateTime createdAt;
}