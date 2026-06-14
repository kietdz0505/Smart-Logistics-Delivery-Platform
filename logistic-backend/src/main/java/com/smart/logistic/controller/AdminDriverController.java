package com.smart.logistic.controller;

import com.smart.logistic.dto.AdminDriverResponse;
import com.smart.logistic.entity.DriverApprovalStatus;
import com.smart.logistic.service.AdminDriverService;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@PreAuthorize("hasRole('ADMIN')")
@RequestMapping("/api/admin/drivers")
public class AdminDriverController {

    private final AdminDriverService adminDriverService;

    public AdminDriverController(AdminDriverService adminDriverService) {
        this.adminDriverService = adminDriverService;
    }

    @GetMapping
    public Page<AdminDriverResponse> getDrivers(@RequestParam DriverApprovalStatus status, @RequestParam(required = false) Integer page, @RequestParam(required = false) Integer size) {

        return adminDriverService.getDriversByStatus(status, page, size);
    }

    @PutMapping("/{userId}/activate")
    public ResponseEntity<?> activateDriver(@PathVariable UUID userId) {

        adminDriverService.updateDriverStatus(userId, DriverApprovalStatus.ACTIVE);

        return ResponseEntity.ok(Map.of("message", "Kích hoạt tài xế thành công"));
    }

    @PutMapping("/{userId}/reject")
    public ResponseEntity<?> rejectDriver(@PathVariable UUID userId) {

        adminDriverService.updateDriverStatus(userId, DriverApprovalStatus.REJECTED);

        return ResponseEntity.ok(Map.of("message", "Đã chuyển tài xế sang trạng thái từ chối"));
    }
}