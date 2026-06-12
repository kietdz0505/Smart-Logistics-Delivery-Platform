package com.smart.logistic.service.impl;

import com.smart.logistic.dto.DriverRegisterRequest;
import com.smart.logistic.entity.*;
import com.smart.logistic.repository.DriverProfileRepository;
import com.smart.logistic.utils.JwtUtil;
import com.smart.logistic.dto.LoginRequest;
import com.smart.logistic.dto.RegisterRequest;
import com.smart.logistic.repository.RoleRepository;
import com.smart.logistic.repository.UserRepository;
import com.smart.logistic.repository.WalletRepository;
import com.smart.logistic.service.RefreshTokenService;
import com.smart.logistic.service.UserService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.smart.logistic.dto.LoginResponse;

import java.math.BigDecimal;
import java.util.UUID;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final WalletRepository walletRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final RefreshTokenService refreshTokenService;
    private final DriverProfileRepository driverProfileRepository;

    public UserServiceImpl(UserRepository userRepository, RoleRepository roleRepository, WalletRepository walletRepository, PasswordEncoder passwordEncoder, JwtUtil jwtUtil, RefreshTokenService refreshTokenService, DriverProfileRepository driverProfileRepository) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.walletRepository = walletRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.refreshTokenService = refreshTokenService;
        this.driverProfileRepository = driverProfileRepository;
    }

    @Transactional
    public User registerUser(RegisterRequest request) {

        if (userRepository.existsByPhone(request.getPhone())) {
            throw new RuntimeException("Số điện thoại này đã được đăng ký!");
        }

        Role role = roleRepository.findByName("ROLE_CUSTOMER").orElseThrow(() -> new RuntimeException("Không tìm thấy role CUSTOMER"));

        User user = new User();
        user.setPhone(request.getPhone().trim());
        user.setEmail(request.getEmail().trim());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setFullName(request.getFullName().trim());
        user.setRole(role);

        User savedUser = userRepository.save(user);

        Wallet wallet = new Wallet();
        wallet.setUser(savedUser);
        wallet.setBalance(BigDecimal.ZERO);

        walletRepository.save(wallet);

        return savedUser;
    }

    public LoginResponse login(LoginRequest request) {

        User user = userRepository.findByPhone(request.getPhone()).orElseThrow(() -> new RuntimeException("Số điện thoại hoặc mật khẩu không chính xác!"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Số điện thoại hoặc mật khẩu không chính xác!");
        }

        if ("ROLE_DRIVER".equals(user.getRole().getName())) {

            DriverProfile profile = driverProfileRepository.findByUser(user).orElseThrow(() -> new RuntimeException("Không tìm thấy hồ sơ tài xế"));

            if (profile.getApprovalStatus() == DriverApprovalStatus.PENDING) {
                throw new RuntimeException("Tài khoản tài xế đang chờ xét duyệt");
            }

            if (profile.getApprovalStatus() == DriverApprovalStatus.REJECTED) {
                throw new RuntimeException("Tài khoản tài xế đã bị từ chối");
            }
        }

        String accessToken = jwtUtil.generateToken(user.getId().toString(), user.getPhone(), user.getRole().getName());
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(user.getId());

        return new LoginResponse(accessToken, refreshToken.getToken(), user.getPhone(), user.getFullName(), user.getRole().getName());
    }

    @Transactional
    public Wallet topUpWallet(com.smart.logistic.dto.TopUpRequest request) {
        User user = userRepository.findById(request.getUserId()).orElseThrow(() -> new RuntimeException("Người dùng không tồn tại!"));

        Wallet wallet = walletRepository.findByUser(user).orElseThrow(() -> new RuntimeException("Tài khoản chưa có ví tiền!"));

        wallet.setBalance(wallet.getBalance().add(request.getAmount()));
        return walletRepository.save(wallet);
    }

    public User findById(UUID id) {
        return userRepository.findById(id).orElseThrow(() -> new RuntimeException("Không tìm thấy tài khoản người dùng/tài xế với ID này!"));
    }

    @Transactional
    public User registerDriver(DriverRegisterRequest request) {

        if (userRepository.existsByPhone(request.getPhone())) {
            throw new RuntimeException("Số điện thoại này đã được đăng ký!");
        }

        Role role = roleRepository.findByName("ROLE_DRIVER").orElseThrow(() -> new RuntimeException("Không tìm thấy role DRIVER"));

        User user = new User();
        user.setPhone(request.getPhone().trim());
        user.setEmail(request.getEmail().trim());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setFullName(request.getFullName().trim());
        user.setRole(role);

        User savedUser = userRepository.save(user);

        DriverProfile profile = new DriverProfile();
        profile.setUser(savedUser);
        profile.setVehicleNumber(request.getVehicleNumber().trim());
        profile.setVehicleType(request.getVehicleType().trim());
        profile.setStatus("OFFLINE");
        profile.setApprovalStatus(DriverApprovalStatus.PENDING);

        driverProfileRepository.save(profile);

        return savedUser;
    }
}