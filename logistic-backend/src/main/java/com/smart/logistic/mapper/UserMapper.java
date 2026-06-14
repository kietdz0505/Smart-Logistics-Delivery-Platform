package com.smart.logistic.mapper;

import com.smart.logistic.dto.UserProfileResponse;
import com.smart.logistic.entity.User;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {

    public UserProfileResponse toProfileResponse(User user) {

        if (user == null) {
            return null;
        }

        UserProfileResponse response = new UserProfileResponse();

        response.setId(user.getId());
        response.setFullName(user.getFullName());
        response.setPhone(user.getPhone());
        response.setEmail(user.getEmail());
        response.setAvatarUrl(user.getAvatarUrl());
        response.setRole(user.getRole().getName());

        return response;
    }
}