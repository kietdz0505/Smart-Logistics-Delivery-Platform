package com.smart.logistic.utils;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
public class AuthUtil {

    public UUID getCurrentUserId() {
        String id = (String) SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getPrincipal();

        return UUID.fromString(id);
    }

    public boolean isDriver() {
        return SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getAuthorities()
                .stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_DRIVER"));
    }
}