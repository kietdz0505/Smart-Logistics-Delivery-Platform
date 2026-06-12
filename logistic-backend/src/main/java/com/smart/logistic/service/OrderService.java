package com.smart.logistic.service;

import com.smart.logistic.dto.CreateOrderRequest;
import com.smart.logistic.dto.DriverHistoryResponse;
import com.smart.logistic.dto.OrderResponse;
import com.smart.logistic.entity.DriverProfile;
import com.smart.logistic.entity.Order;
import com.smart.logistic.entity.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

public interface OrderService {

    Order createOrder(CreateOrderRequest request);

    List<DriverProfile> findDriversForOrder(UUID orderId);

    Order acceptOrder(UUID orderId);

    Order getOrderById(UUID orderId);

    List<Order> getOrdersByStatus(OrderStatus status);

    Order completeOrderWithImage(UUID orderId, MultipartFile podImage);

    Order customerCancelOrder(UUID orderId, String reason);

    Order driverCancelOrder(UUID orderId, String reason);

    List<Order> getActiveOrdersForDriver(UUID driverId);

    Order startDelivery(UUID orderId, String otp);

    OrderResponse getOrderDetailsWithDriverLocation(UUID orderId);

    List<Order> getActiveOrdersByCustomer(UUID customerId);

    Page<Order> getHistoryOrdersByCustomer(UUID customerId, int page, int size);

    DriverHistoryResponse getDriverHistory(UUID driverId, int page, int size);
}
