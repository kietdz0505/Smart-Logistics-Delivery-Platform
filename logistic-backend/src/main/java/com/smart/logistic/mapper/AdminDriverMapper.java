package com.smart.logistic.mapper;

import com.smart.logistic.dto.AdminDriverResponse;
import com.smart.logistic.entity.DriverProfile;
import org.springframework.stereotype.Component;

@Component
public class AdminDriverMapper {

    public AdminDriverResponse mapToResponse(DriverProfile profile) {

        AdminDriverResponse dto = new AdminDriverResponse();

        dto.setId(profile.getUser().getId());

        dto.setFullName(profile.getUser().getFullName());

        dto.setPhone(profile.getUser().getPhone());

        dto.setEmail(profile.getUser().getEmail());

        dto.setVehicleNumber(profile.getVehicleNumber());

        dto.setVehicleType(profile.getVehicleType());

        dto.setApprovalStatus(profile.getApprovalStatus());

        return dto;
    }
}
