package com.smart.logistic.utils;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
public class AuthUtil {

    public UUID getCurrentUserId() {
        return UUID.fromString(
                SecurityContextHolder
                        .getContext()
                        .getAuthentication()
                        .getPrincipal()
                        .toString()
        );
    }

    public String getCurrentRole() {
        return SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getAuthorities()
                .stream()
                .findFirst()
                .orElseThrow()
                .getAuthority();
    }

    public boolean isDriver() {
        return "ROLE_DRIVER".equals(getCurrentRole());
    }

    public boolean isCustomer() {
        return "ROLE_CUSTOMER".equals(getCurrentRole());
    }

    public boolean isAdmin() {
        return "ROLE_ADMIN".equals(getCurrentRole());
    }
}