package com.smart.logistic.service;

import com.smart.logistic.dto.*;
import com.smart.logistic.entity.User;
import com.smart.logistic.entity.Wallet;
import org.springframework.stereotype.Service;

import java.util.UUID;


@Service
public interface UserService {

    User registerUser(RegisterRequest request);

    LoginResponse login(LoginRequest request);

    Wallet topUpWallet(TopUpRequest request);

    User findById(UUID id);

    User registerDriver(DriverRegisterRequest request);

    UserProfileResponse getMyProfile();

    UserProfileResponse updateProfile(UpdateProfileRequest request);
}