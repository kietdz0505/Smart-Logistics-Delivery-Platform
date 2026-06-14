package com.smart.logistic.dto;

import jakarta.validation.constraints.Email;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateProfileRequest {

    private String fullName;

    @Email(message = "Email không hợp lệ")
    private String email;

    private String avatarUrl;
}