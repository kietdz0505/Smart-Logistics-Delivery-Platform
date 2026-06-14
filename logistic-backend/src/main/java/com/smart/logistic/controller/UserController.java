package com.smart.logistic.controller;

import com.smart.logistic.dto.UpdateProfileRequest;
import com.smart.logistic.entity.User;
import com.smart.logistic.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/me")
    public ResponseEntity<?> getMyProfile() {

        return ResponseEntity.ok(userService.getMyProfile());
    }

    @PatchMapping("/me")
    public ResponseEntity<?> updateProfile(@Valid @RequestBody UpdateProfileRequest request) {

        return ResponseEntity.ok(Map.of("message", "Cập nhật thông tin thành công", "user", userService.updateProfile(request)));
    }
}