package com.smart.logistic.controller;

import com.smart.logistic.dto.AcceptOrderRequest;
import com.smart.logistic.dto.CreateOrderRequest;
import com.smart.logistic.dto.OrderResponse;
import com.smart.logistic.entity.DriverProfile;
import com.smart.logistic.entity.Order;
import com.smart.logistic.entity.User;
import com.smart.logistic.mapper.DriverMapper;
import com.smart.logistic.mapper.OrderMapper;
import com.smart.logistic.repository.WalletRepository;
import com.smart.logistic.service.OrderService;
import com.smart.logistic.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;
    private final UserService userService;
    private final WalletRepository walletRepository;
    private final OrderMapper orderMapper;
    private final DriverMapper driverMapper;

    public OrderController(OrderService orderService, UserService userService, WalletRepository walletRepository, OrderMapper orderMapper, DriverMapper driverMapper) {
        this.orderService = orderService;
        this.userService = userService;
        this.walletRepository = walletRepository;
        this.orderMapper = orderMapper;
        this.driverMapper = driverMapper;
    }

    @PostMapping("/create")
    public ResponseEntity<?> createOrder(@RequestBody CreateOrderRequest request) {
        try {
            Order order = orderService.createOrder(request);
            return ResponseEntity.ok(orderMapper.toResponse(order));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/accept")
    public ResponseEntity<?> acceptOrder(@RequestBody AcceptOrderRequest request) {
        try {
            Order order = orderService.acceptOrder(request);
            return ResponseEntity.ok(orderMapper.toResponse(order));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/pending")
    public ResponseEntity<?> getPendingOrders() {
        try {
            List<Order> pendingOrders = orderService.getOrdersByStatus("PENDING");

            List<OrderResponse> result = pendingOrders.stream().map(orderMapper::toResponse).collect(Collectors.toList());

            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/driver/{driverId}/active")
    public ResponseEntity<?> getDriverActiveOrders(@PathVariable UUID driverId) {
        try {
            List<Order> activeOrders = orderService.getOrdersByDriverAndStatus(driverId, "ACCEPTED");

            List<OrderResponse> result = activeOrders.stream().map(orderMapper::toResponse).collect(Collectors.toList());

            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/complete")
    public ResponseEntity<?> completeOrder(@RequestBody Map<String, String> request) {
        try {
            UUID orderId = UUID.fromString(request.get("orderId"));
            orderService.completeOrder(orderId);

            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("message", "🏁 Đơn hàng đã được hoàn thành thành công!");
            response.put("orderId", orderId);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/driver/{driverId}/history")
    public ResponseEntity<?> getDriverHistory(@PathVariable UUID driverId) {
        try {
            List<Order> historyOrders = orderService.getOrdersByDriverAndStatus(driverId, "COMPLETED");
            List<Map<String, Object>> result = historyOrders.stream()
                    .map(orderMapper::toDriverHistoryMap)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/driver/{driverId}/wallet")
    public ResponseEntity<?> getDriverWallet(@PathVariable UUID driverId) {
        try {
            User driver = userService.findById(driverId);
            com.smart.logistic.entity.Wallet wallet = walletRepository.findByUser(driver).orElseThrow(() -> new RuntimeException("Tài xế chưa được kích hoạt ví tiền hệ thống!"));

            Map<String, Object> response = new HashMap<>();
            response.put("balance", wallet.getBalance());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi lấy số dư ví: " + e.getMessage());
        }
    }

    @GetMapping("/customer/{customerId}/history")
    public ResponseEntity<?> getCustomerHistory(@PathVariable UUID customerId) {
        try {
            List<Order> orders = orderService.getOrdersByCustomer(customerId);
            List<Map<String, Object>> result = orders.stream()
                    .map(orderMapper::toCustomerHistoryMap)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/customer-cancel")
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

    @PostMapping("/driver-cancel")
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

    @GetMapping("/{orderId}/nearby-drivers")
    public ResponseEntity<?> getNearbyDrivers(@PathVariable UUID orderId) {
        try {
            List<DriverProfile> drivers = orderService.findDriversForOrder(orderId);
            List<Map<String, Object>> result = drivers.stream()
                    .map(driverMapper::toNearbyDriverMap)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}