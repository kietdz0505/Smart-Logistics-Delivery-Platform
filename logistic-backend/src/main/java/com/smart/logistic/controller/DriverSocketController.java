package com.smart.logistic.controller;

import com.smart.logistic.dto.DriverLocationRequest;
import com.smart.logistic.entity.Order;
import com.smart.logistic.repository.DriverProfileRepository;
import com.smart.logistic.repository.OrderRepository;
import com.smart.logistic.utils.GeometryUtil;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Controller
public class DriverSocketController {

    private final SimpMessagingTemplate messagingTemplate;

    private final OrderRepository orderRepository;

    private final DriverProfileRepository driverProfileRepository;

    public DriverSocketController(SimpMessagingTemplate messagingTemplate, OrderRepository orderRepository, DriverProfileRepository driverProfileRepository) {
        this.messagingTemplate = messagingTemplate;
        this.orderRepository = orderRepository;
        this.driverProfileRepository = driverProfileRepository;
    }

    @MessageMapping("/driver/screen-online")
    public void handleDriverOnlineLobby(DriverLocationRequest request) {
        if (request.getDriverId() == null) return;

        double radiusInMeters = request.getMaxRadius() * 1000;

        List<Order> filteredOrders = orderRepository.findPendingOrdersWithinRadius(
                request.getLatitude(),
                request.getLongitude(),
                radiusInMeters
        );

        System.out.println("Backend tìm thấy " + filteredOrders.size() + " đơn hàng trong bán kính " + request.getMaxRadius());

        messagingTemplate.convertAndSend(
                "/topic/orders/driver/" + request.getDriverId(),
                filteredOrders
        );
    }

    @MessageMapping("/driver/share-location")
    public void handleDriverRouteTracking(DriverLocationRequest request) {
        if (request.getOrderId() == null) {
            System.err.println("Lỗi: Nhận tin nhắn share-location nhưng không có orderId!");
            return;
        }

        String orderId = request.getOrderId();

        try {
            UUID uuidOrderId = UUID.fromString(orderId);

            orderRepository.findById(uuidOrderId).ifPresent(order -> {
                if (order.getDriver() != null) {
                    UUID driverUserId = order.getDriver().getId();

                    driverProfileRepository.findByUserId(driverUserId).ifPresent(profile -> {
                        profile.setCurrentLocation(GeometryUtil.createPoint(request.getLongitude(), request.getLatitude()));
                        driverProfileRepository.save(profile);
                    });
                } else {
                    System.err.println("Cảnh báo: Đơn hàng " + orderId + " chưa được gán tài xế trong DB!");
                }
            });
        } catch (Exception e) {
            System.err.println("Lỗi xử lý DB khi sync vị trí: " + e.getMessage());
        }

        Map<String, Double> locationData = new HashMap<>();
        locationData.put("latitude", request.getLatitude());
        locationData.put("longitude", request.getLongitude());

        String destinationTopic = "/topic/order/" + orderId + "/location";
        messagingTemplate.convertAndSend(destinationTopic, locationData);

        System.out.printf("Đã broadcast tới Khách hàng qua kênh: %s%n", destinationTopic);
    }
}