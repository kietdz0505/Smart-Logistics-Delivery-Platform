package com.smart.logistic.controller;

import com.smart.logistic.dto.TopUpRequest;
import com.smart.logistic.entity.User;
import com.smart.logistic.entity.Wallet;
import com.smart.logistic.repository.WalletRepository;
import com.smart.logistic.service.UserService;
import com.smart.logistic.utils.AuthUtil;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/wallets")
public class WalletController {

    private final UserService userService;
    private final AuthUtil authUtil;
    private final WalletRepository walletRepository;

    public WalletController(UserService userService, AuthUtil authUtil, WalletRepository walletRepository) {
        this.userService = userService;
        this.authUtil = authUtil;
        this.walletRepository = walletRepository;
    }

    @PostMapping("/topup")
    public ResponseEntity<?> topUp(@RequestBody TopUpRequest request) {
        try {
            Wallet updatedWallet = userService.topUpWallet(request);

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

    @PreAuthorize("hasRole('DRIVER') or hasRole('CUSTOMER')")
    @GetMapping("/balance")
    public ResponseEntity<?> getWalletBalance() {

        User currentUser = userService.findById(
                authUtil.getCurrentUserId()
        );

        var wallet = walletRepository.findByUser(currentUser)
                .orElseThrow(() ->
                        new RuntimeException("Không tìm thấy ví cho người dùng này"));
        return ResponseEntity.ok(
                Map.of("balance", wallet.getBalance())
        );
    }
}