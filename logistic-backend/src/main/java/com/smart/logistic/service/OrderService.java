package com.smart.logistic.service;

import com.smart.logistic.dto.CreateOrderRequest;
import com.smart.logistic.dto.OrderResponse;
import com.smart.logistic.entity.DriverProfile;
import com.smart.logistic.entity.Order;
import com.smart.logistic.entity.OrderStatus;

import java.util.List;
import java.util.UUID;

public interface OrderService {

    Order createOrder(CreateOrderRequest request);

    List<DriverProfile> findDriversForOrder(UUID orderId);

    Order acceptOrder(UUID orderId);

    Order getOrderById(UUID orderId);

    List<Order> getOrdersByStatus(OrderStatus status);

    Order completeOrder(UUID orderId);

    List<Order> getOrdersByDriverAndStatus(UUID driverId, OrderStatus status);

    Order customerCancelOrder(UUID orderId, String reason);

    Order driverCancelOrder(UUID orderId, String reason);

    List<Order> getOrdersByCustomer(UUID customerId);

    List<Order> getActiveOrdersForDriver(UUID driverId);

    Order startDelivery(UUID orderId);

    OrderResponse getOrderDetailsWithDriverLocation(UUID orderId);


}