package com.smart.logistic.controller;

import com.smart.logistic.dto.DriverRegisterRequest;
import com.smart.logistic.utils.JwtUtil;
import com.smart.logistic.dto.LoginRequest;
import com.smart.logistic.dto.LoginResponse;
import com.smart.logistic.dto.RegisterRequest;
import com.smart.logistic.entity.User;
import com.smart.logistic.service.RefreshTokenService;
import com.smart.logistic.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserService userService;
    private final RefreshTokenService refreshTokenService;
    private final JwtUtil jwtUtil;

    public AuthController(UserService userService, RefreshTokenService refreshTokenService, JwtUtil jwtUtil) {
        this.userService = userService;
        this.refreshTokenService = refreshTokenService;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {

        User registeredUser = userService.registerUser(request);

        return ResponseEntity.ok(Map.of("message", "Đăng ký tài khoản thành công"));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            LoginResponse response = userService.login(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/refresh-token")
    public ResponseEntity<?> refreshToken(@RequestBody com.smart.logistic.dto.TokenRefreshRequest request) {
        String requestRefreshToken = request.getRefreshToken();

        return refreshTokenService.findByToken(requestRefreshToken).map(refreshTokenService::verifyExpiration).map(com.smart.logistic.entity.RefreshToken::getUser).map(user -> {
            String accessToken = jwtUtil.generateToken(user.getId().toString(), user.getPhone(), user.getRole().getName());
            java.util.Map<String, String> response = new java.util.HashMap<>();
            response.put("accessToken", accessToken);
            response.put("refreshToken", requestRefreshToken);
            return ResponseEntity.ok(response);
        }).orElseThrow(() -> new RuntimeException("Refresh token không tồn tại trong hệ thống!"));
    }

    @PostMapping("/register-driver")
    public ResponseEntity<?> registerDriver(@Valid @RequestBody DriverRegisterRequest request) {

        userService.registerDriver(request);

        return ResponseEntity.ok(Map.of("message", "Đăng ký tài xế thành công. Vui lòng chờ xét duyệt."));
    }
}