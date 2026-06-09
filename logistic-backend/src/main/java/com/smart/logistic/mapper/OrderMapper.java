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
        response.setStatus(order.getStatus().name());
        response.setCreatedAt(order.getCreatedAt());
        response.setPickupOtp(order.getPickupOtp());
        if (order.getPickupLocation() != null) {
            response.setPickupLongitude(order.getPickupLocation().getX());
            response.setPickupLatitude(order.getPickupLocation().getY());
        }

        if (order.getDeliveryLocation() != null) {
            response.setDeliveryLongitude(order.getDeliveryLocation().getX());
            response.setDeliveryLatitude(order.getDeliveryLocation().getY());
        }

        if(order.getDriver() != null){
            response.setDriverName(order.getDriver().getFullName());
            response.setDriverPhone(order.getDriver().getPhone());
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
        map.put("distanceKm", order.getDistanceKm());
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
        map.put("updatedAt", order.getUpdatedAt());
        map.put("distanceKm", order.getDistanceKm());

        if (order.getDriver() != null) {
            map.put("driverName", order.getDriver().getFullName());
            map.put("driverPhone", order.getDriver().getPhone());
        } else {
            map.put("driverName", "Đang tìm tài xế...");
            map.put("driverPhone", null);
        }

        return map;
    }
}