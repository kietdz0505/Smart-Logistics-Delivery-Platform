package com.smart.logistic.controller;

import com.smart.logistic.dto.TopUpRequest;
import com.smart.logistic.entity.Wallet;
import com.smart.logistic.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/wallets")
public class WalletController {

    private final UserService userService;

    public WalletController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/topup")
    public ResponseEntity<?> topUp(@RequestBody TopUpRequest request) {
        try {
            Wallet updatedWallet = userService.topUpWallet(request);

            // Trả về một cấu trúc JSON sạch chứa số dư mới
            Map<String, Object> response = new java.util.HashMap<>();
            response.put("walletId", updatedWallet.getId());
            response.put("userId", updatedWallet.getUser().getId());
            response.put("fullName", updatedWallet.getUser().getFullName());
            response.put("balance", updatedWallet.getBalance());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}