package com.smart.logistic.mapper;

import com.smart.logistic.dto.OrderResponse;
import com.smart.logistic.entity.Order;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

@Component
public class OrderMapper {

    public OrderResponse toResponse(Order order) {
        if (order == null) {
            return null;
        }

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

        // Đọc an toàn tọa độ X (Longitude) và Y (Latitude) từ PostGIS Point
        if (order.getPickupLocation() != null) {
            response.setPickupLongitude(order.getPickupLocation().getX());
            response.setPickupLatitude(order.getPickupLocation().getY());
        }

        if (order.getDeliveryLocation() != null) {
            response.setDeliveryLongitude(order.getDeliveryLocation().getX());
            response.setDeliveryLatitude(order.getDeliveryLocation().getY());
        }

        return response;
    }

    public Map<String, Object> toDriverHistoryMap(Order order) {
        if (order == null) return null;

        Map<String, Object> map = new HashMap<>();
        map.put("id", order.getId());
        map.put("senderName", order.getSenderName());
        map.put("pickupAddress", order.getPickupAddress());
        map.put("deliveryAddress", order.getDeliveryAddress());
        map.put("price", order.getPrice());
        map.put("updatedAt", order.getUpdatedAt());
        return map;
    }

    public Map<String, Object> toCustomerHistoryMap(Order order) {
        if (order == null) return null;

        Map<String, Object> map = new HashMap<>();
        map.put("id", order.getId());
        map.put("pickupAddress", order.getPickupAddress());
        map.put("deliveryAddress", order.getDeliveryAddress());
        map.put("price", order.getPrice());
        map.put("status", order.getStatus());
        map.put("createdAt", order.getCreatedAt());
        map.put("driverName", order.getDriver() != null ? order.getDriver().getFullName() : "Đang tìm tài xế...");
        return map;
    }
}