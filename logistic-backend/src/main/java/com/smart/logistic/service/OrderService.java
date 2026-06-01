package com.smart.logistic.service;

import com.smart.logistic.dto.AcceptOrderRequest;
import com.smart.logistic.dto.CreateOrderRequest;
import com.smart.logistic.entity.DriverProfile;
import com.smart.logistic.entity.Order;

import java.util.List;
import java.util.UUID;

public interface OrderService {

    Order createOrder(CreateOrderRequest request);

    List<DriverProfile> findDriversForOrder(UUID orderId);

    Order acceptOrder(AcceptOrderRequest request);

    List<Order> getOrdersByStatus(String status);

    Order completeOrder(UUID orderId);
}