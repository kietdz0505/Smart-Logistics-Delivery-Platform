package com.smart.logistic.mapper;

import com.smart.logistic.entity.DriverProfile;
import org.springframework.stereotype.Component;
import java.util.HashMap;
import java.util.Map;

@Component
public class DriverMapper {


    public Map<String, Object> toNearbyDriverMap(DriverProfile driver) {
        if (driver == null) return null;

        Map<String, Object> map = new HashMap<>();
        map.put("driverId", driver.getId());
        map.put("fullName", driver.getUser() != null ? driver.getUser().getFullName() : "N/A");
        map.put("phone", driver.getUser() != null ? driver.getUser().getPhone() : "N/A");
        map.put("vehicleNumber", driver.getVehicleNumber());
        map.put("status", driver.getStatus());

        if (driver.getCurrentLocation() != null) {
            map.put("longitude", driver.getCurrentLocation().getX());
            map.put("latitude", driver.getCurrentLocation().getY());
        }
        return map;
    }
}