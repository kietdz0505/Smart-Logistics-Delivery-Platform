package com.smart.logistic.service;

import com.smart.logistic.config.PaginationProperties;
import com.smart.logistic.dto.AdminDriverResponse;
import com.smart.logistic.entity.DriverApprovalStatus;
import com.smart.logistic.entity.DriverProfile;
import com.smart.logistic.mapper.AdminDriverMapper;
import com.smart.logistic.repository.DriverProfileRepository;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class AdminDriverService {

    private final DriverProfileRepository driverProfileRepository;
    private final AdminDriverMapper adminDriverMapper;
    private final PaginationProperties paginationProperties;

    public AdminDriverService(DriverProfileRepository driverProfileRepository, AdminDriverMapper adminDriverMapper, PaginationProperties paginationProperties) {
        this.driverProfileRepository = driverProfileRepository;
        this.adminDriverMapper = adminDriverMapper;
        this.paginationProperties = paginationProperties;
    }

    public Page<AdminDriverResponse> getDriversByStatus(DriverApprovalStatus status, Integer page, Integer size) {

        Pageable pageable = PageRequest.of(page != null ? page : paginationProperties.getDefaultPage(), size != null ? size : paginationProperties.getDefaultSize());

        return driverProfileRepository.findByApprovalStatus(status, pageable).map(adminDriverMapper::mapToResponse);
    }

    @Transactional
    public void updateDriverStatus(UUID userId, DriverApprovalStatus status) {

        DriverProfile profile = driverProfileRepository.findByUserId(userId).orElseThrow(() -> new RuntimeException("Không tìm thấy tài xế"));

        profile.setApprovalStatus(status);

        driverProfileRepository.save(profile);
    }
}