package com.smart.logistic.controller;

import com.smart.logistic.dto.AcceptOrderRequest;
import com.smart.logistic.dto.CreateOrderRequest;
import com.smart.logistic.dto.OrderResponse;
import com.smart.logistic.entity.DriverProfile;
import com.smart.logistic.entity.Order;
import com.smart.logistic.service.OrderService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping("/create")
    public ResponseEntity<?> createOrder(@RequestBody CreateOrderRequest request) {
        try {
            Order order = orderService.createOrder(request);

            // Chuyển đổi Entity thành DTO sạch trước khi trả về JSON
            OrderResponse response = new OrderResponse();
            response.setId(order.getId());
            response.setSenderName(order.getSenderName());
            response.setSenderPhone(order.getSenderPhone());
            response.setReceiverName(order.getReceiverName());
            response.setReceiverPhone(order.getReceiverPhone());
            response.setPickupAddress(order.getPickupAddress());
            response.setDeliveryAddress(order.getDeliveryAddress());
            response.setDistanceKm(order.getDistanceKm());
            response.setPrice(order.getPrice());
            response.setStatus(order.getStatus());
            response.setCreatedAt(order.getCreatedAt());

            // Lấy tọa độ từ PostGIS Point ra lại thành số double để nạp vào DTO
            if (order.getPickupLocation() != null) {
                response.setPickupLongitude(order.getPickupLocation().getX());
                response.setPickupLatitude(order.getPickupLocation().getY());
            }
            if (order.getDeliveryLocation() != null) {
                response.setDeliveryLongitude(order.getDeliveryLocation().getX());
                response.setDeliveryLatitude(order.getDeliveryLocation().getY());
            }

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/{orderId}/nearby-drivers")
    public ResponseEntity<?> getNearbyDrivers(@PathVariable UUID orderId) {
        try {
           List<DriverProfile> drivers = orderService.findDriversForOrder(orderId);

            // Để tránh lỗi tuần hoàn JSON (Circular Reference) từ thực thể JPA khi trả về,
            // Chúng ta chuyển thông tin tài xế ra một cấu trúc List Map đơn giản để xem kết quả nhanh.
            List<Map<String, Object>> result = new ArrayList<>();

            for (com.smart.logistic.entity.DriverProfile d : drivers) {
                java.util.Map<String, Object> map = new java.util.HashMap<>();
                map.put("driverId", d.getId());
                map.put("fullName", d.getUser().getFullName());
                map.put("phone", d.getUser().getPhone());
                map.put("vehicleNumber", d.getVehicleNumber());
                map.put("status", d.getStatus());
                if (d.getCurrentLocation() != null) {
                    map.put("longitude", d.getCurrentLocation().getX());
                    map.put("latitude", d.getCurrentLocation().getY());
                }
                result.add(map);
            }

            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/accept")
    public ResponseEntity<?> acceptOrder(@RequestBody AcceptOrderRequest request) {
        try {
            Order order = orderService.acceptOrder(request);

            // Chuyển sang DTO sạch giống như lúc tạo đơn để tránh lỗi Jackson Geometry
            OrderResponse response = new OrderResponse();
            response.setId(order.getId());
            response.setSenderName(order.getSenderName());
            response.setSenderPhone(order.getSenderPhone());
            response.setReceiverName(order.getReceiverName());
            response.setReceiverPhone(order.getReceiverPhone());
            response.setPickupAddress(order.getPickupAddress());
            response.setDeliveryAddress(order.getDeliveryAddress());
            response.setDistanceKm(order.getDistanceKm());
            response.setPrice(order.getPrice());
            response.setStatus(order.getStatus());
            response.setCreatedAt(order.getCreatedAt());

            if (order.getPickupLocation() != null) {
                response.setPickupLongitude(order.getPickupLocation().getX());
                response.setPickupLatitude(order.getPickupLocation().getY());
            }
            if (order.getDeliveryLocation() != null) {
                response.setDeliveryLongitude(order.getDeliveryLocation().getX());
                response.setDeliveryLatitude(order.getDeliveryLocation().getY());
            }

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/pending")
    public ResponseEntity<?> getPendingOrders() {
        try {
            // Gọi Service lấy tất cả đơn hàng có trạng thái PENDING dưới DB
            List<Order> pendingOrders = orderService.getOrdersByStatus("PENDING");

            // Chuyển đổi danh sách Entity thành DTO sạch để tránh lỗi tuần hoàn JSON / Geometry Jackson
            List<OrderResponse> result = new ArrayList<>();
            for (Order order : pendingOrders) {
                OrderResponse response = new OrderResponse();
                response.setId(order.getId());
                response.setSenderName(order.getSenderName());
                response.setSenderPhone(order.getSenderPhone());
                response.setReceiverName(order.getReceiverName());
                response.setReceiverPhone(order.getReceiverPhone());
                response.setPickupAddress(order.getPickupAddress());
                response.setDeliveryAddress(order.getDeliveryAddress());
                response.setDistanceKm(order.getDistanceKm());
                response.setPrice(order.getPrice());
                response.setStatus(order.getStatus());
                response.setCreatedAt(order.getCreatedAt());

                if (order.getPickupLocation() != null) {
                    response.setPickupLongitude(order.getPickupLocation().getX());
                    response.setPickupLatitude(order.getPickupLocation().getY());
                }
                if (order.getDeliveryLocation() != null) {
                    response.setDeliveryLongitude(order.getDeliveryLocation().getX());
                    response.setDeliveryLatitude(order.getDeliveryLocation().getY());
                }
                result.add(response);
            }

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
            e.printStackTrace();
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}