package com.smart.logistic.dto;

import lombok.Getter;
import lombok.Setter;
import java.util.UUID;

@Getter
@Setter
public class AcceptOrderRequest {
    private UUID orderId;
    private UUID driverId; // ID của tài xế nhận đơn
}