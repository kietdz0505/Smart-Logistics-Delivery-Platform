package com.smart.logistic.controller;

import com.smart.logistic.dto.CreateOrderRequest;
import com.smart.logistic.dto.OrderResponse;
import com.smart.logistic.entity.DriverProfile;
import com.smart.logistic.entity.Order;
import com.smart.logistic.entity.OrderStatus;
import com.smart.logistic.mapper.DriverMapper;
import com.smart.logistic.mapper.OrderMapper;
import com.smart.logistic.repository.WalletRepository;
import com.smart.logistic.service.OrderService;
import com.smart.logistic.utils.AuthUtil;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;
    private final OrderMapper orderMapper;
    private final DriverMapper driverMapper;
    private final AuthUtil authUtil;

    public OrderController(OrderService orderService, WalletRepository walletRepository, OrderMapper orderMapper, DriverMapper driverMapper, AuthUtil authUtil) {
        this.orderService = orderService;
        this.orderMapper = orderMapper;
        this.driverMapper = driverMapper;
        this.authUtil = authUtil;
    }

    @PreAuthorize("hasAnyRole('CUSTOMER', 'DRIVER')")
    @GetMapping("/{orderId}")
    public ResponseEntity<?> getOrderDetails(@PathVariable UUID orderId) {
        try {
            OrderResponse response = orderService.getOrderDetailsWithDriverLocation(orderId);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PreAuthorize("hasRole('CUSTOMER')")
    @PostMapping("/create")
    public ResponseEntity<?> createOrder(@RequestBody CreateOrderRequest request) {
        try {
            Order order = orderService.createOrder(request);
            return ResponseEntity.ok(orderMapper.toResponse(order));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PreAuthorize("hasRole('DRIVER')")
    @PutMapping("/accept")
    public ResponseEntity<?> acceptOrder(@RequestBody Map<String, String> request) {
        try {
            UUID orderId = UUID.fromString(request.get("orderId"));

            Order order = orderService.acceptOrder(orderId);

            return ResponseEntity.ok(orderMapper.toResponse(order));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PreAuthorize("hasRole('DRIVER')")
    @GetMapping("/pending")
    public ResponseEntity<?> getPendingOrders() {
        try {
            List<Order> pendingOrders = orderService.getOrdersByStatus(OrderStatus.PENDING);

            List<OrderResponse> result = pendingOrders.stream().map(orderMapper::toResponse).toList();

            return ResponseEntity.ok(result);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PreAuthorize("hasRole('DRIVER')")
    @PutMapping("/start-delivery")
    public ResponseEntity<?> startDelivery(@RequestBody Map<String, String> request) {

        try {
            UUID orderId = UUID.fromString(request.get("orderId"));

            orderService.startDelivery(orderId);

            return ResponseEntity.ok("Đơn hàng đang được giao");

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PreAuthorize("hasRole('DRIVER')")
    @GetMapping("/driver/active")
    public ResponseEntity<?> getDriverActiveOrders() {

        List<Order> activeOrders = orderService.getActiveOrdersForDriver(authUtil.getCurrentUserId());

        return ResponseEntity.ok(activeOrders.stream().map(orderMapper::toResponse).toList());
    }

    @PreAuthorize("hasRole('DRIVER')")
    @PutMapping("/complete")
    public ResponseEntity<?> completeOrder(@RequestBody Map<String, String> request) {

        try {
            UUID orderId = UUID.fromString(request.get("orderId"));

            orderService.completeOrder(orderId);

            return ResponseEntity.ok(Map.of("status", "success", "message", "🏁 Đơn hàng đã được hoàn thành thành công!", "orderId", orderId));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PreAuthorize("hasRole('DRIVER')")
    @GetMapping("/driver/history")
    public ResponseEntity<?> getDriverHistory() {

        List<Order> history = orderService.getOrdersByDriverAndStatus(authUtil.getCurrentUserId(), OrderStatus.COMPLETED);

        return ResponseEntity.ok(history.stream().map(orderMapper::toDriverHistoryMap).toList());
    }

    @PreAuthorize("hasRole('CUSTOMER')")
    @GetMapping("/customer/history")
    public ResponseEntity<?> getCustomerHistory() {

        try {
            List<Order> orders = orderService.getOrdersByCustomer(authUtil.getCurrentUserId());

            List<Map<String, Object>> result = orders.stream().map(orderMapper::toCustomerHistoryMap).toList();

            return ResponseEntity.ok(result);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PreAuthorize("hasRole('CUSTOMER')")
    @PutMapping("/customer-cancel")
    public ResponseEntity<?> customerCancelOrder(@RequestBody Map<String, String> request) {

        try {
            UUID orderId = UUID.fromString(request.get("orderId"));

            String reason = request.getOrDefault("reason", "Khách hàng chủ động hủy khi chưa có xe nhận");

            Order cancelledOrder = orderService.customerCancelOrder(orderId, reason);

            return ResponseEntity.ok("Hủy đơn thành công! Trạng thái hiện tại: " + cancelledOrder.getStatus());

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PreAuthorize("hasRole('DRIVER')")
    @PutMapping("/driver-cancel")
    public ResponseEntity<?> driverCancelOrder(@RequestBody Map<String, String> request) {

        try {
            UUID orderId = UUID.fromString(request.get("orderId"));

            String reason = request.getOrDefault("reason", "Tài xế báo hủy cuốc vì sự cố dọc đường");

            Order releasedOrder = orderService.driverCancelOrder(orderId, reason);

            return ResponseEntity.ok("Tài xế hủy cuốc thành công! Trạng thái: " + releasedOrder.getStatus());

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PreAuthorize("hasRole('CUSTOMER')")
    @GetMapping("/{orderId}/nearby-drivers")
    public ResponseEntity<?> getNearbyDrivers(@PathVariable UUID orderId) {

        try {
            List<DriverProfile> drivers = orderService.findDriversForOrder(orderId);

            List<Map<String, Object>> result = drivers.stream().map(driverMapper::toNearbyDriverMap).toList();

            return ResponseEntity.ok(result);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}