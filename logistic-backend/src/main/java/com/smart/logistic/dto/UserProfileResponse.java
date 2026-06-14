package com.smart.logistic.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
public class UserProfileResponse {

    private UUID id;

    private String fullName;

    private String phone;

    private String email;

    private String avatarUrl;

    private String role;
}