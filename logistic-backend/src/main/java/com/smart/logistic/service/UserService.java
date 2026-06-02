package com.smart.logistic.service;

import com.smart.logistic.dto.LoginRequest;
import com.smart.logistic.dto.RegisterRequest;
import com.smart.logistic.entity.User;
import com.smart.logistic.entity.Wallet;
import org.springframework.stereotype.Service;
import com.smart.logistic.dto.LoginResponse;

import java.util.UUID;


@Service
public interface UserService {

    User registerUser(RegisterRequest request);

    LoginResponse login(LoginRequest request);

    Wallet topUpWallet(com.smart.logistic.dto.TopUpRequest request);

    User findById(UUID id);
}