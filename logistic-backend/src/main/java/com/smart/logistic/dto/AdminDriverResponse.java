package com.smart.logistic.dto;

import com.smart.logistic.entity.DriverApprovalStatus;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
public class AdminDriverResponse {

    private UUID id;

    private String fullName;

    private String phone;

    private String email;

    private String vehicleNumber;

    private String vehicleType;

    private DriverApprovalStatus approvalStatus;
}