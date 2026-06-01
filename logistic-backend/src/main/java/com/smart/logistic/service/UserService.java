package com.smart.logistic.service;

import com.smart.logistic.config.JwtUtil;
import com.smart.logistic.dto.LoginRequest;
import com.smart.logistic.dto.RegisterRequest;
import com.smart.logistic.entity.RefreshToken;
import com.smart.logistic.entity.Role;
import com.smart.logistic.entity.User;
import com.smart.logistic.entity.Wallet;
import com.smart.logistic.repository.RoleRepository;
import com.smart.logistic.repository.UserRepository;
import com.smart.logistic.repository.WalletRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.smart.logistic.dto.LoginResponse;
import java.math.BigDecimal;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final WalletRepository walletRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final RefreshTokenService refreshTokenService;

    // Inject các phụ thuộc qua Constructor
    public UserService(UserRepository userRepository, RoleRepository roleRepository, WalletRepository walletRepository, PasswordEncoder passwordEncoder, JwtUtil jwtUtil, RefreshTokenService refreshTokenService) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.walletRepository = walletRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.refreshTokenService = refreshTokenService;
    }

    @Transactional // Đảm bảo nếu tạo user lỗi thì ví tiền không được tạo (Rollback)
    public User registerUser(RegisterRequest request) {
        // 1. Kiểm tra trùng số điện thoại
        if (userRepository.existsByPhone(request.getPhone())) {
            throw new RuntimeException("Số điện thoại này đã được đăng ký!");
        }

        // 2. Tìm Role tương ứng trong DB
        Role role = roleRepository.findByName(request.getRoleName()).orElseThrow(() -> new RuntimeException("Vai trò người dùng không hợp lệ!"));

        // 3. Tạo thực thể User mới và mã hóa mật khẩu
        User user = new User();
        user.setPhone(request.getPhone());
        user.setPassword(passwordEncoder.encode(request.getPassword())); // Mã hóa BCrypt
        user.setFullName(request.getFullName());
        user.setRole(role);

        User savedUser = userRepository.save(user);

        // 4. Tự động kích hoạt ví tiền (Wallet) với số dư 0đ cho người dùng mới
        Wallet wallet = new Wallet();
        wallet.setUser(savedUser);
        wallet.setBalance(BigDecimal.ZERO);
        walletRepository.save(wallet);

        return savedUser;
    }

    public LoginResponse login(LoginRequest request) {

        User user = userRepository.findByPhone(request.getPhone())
                .orElseThrow(() ->
                        new RuntimeException(
                                "Số điện thoại hoặc mật khẩu không chính xác!"
                        ));

        if (!passwordEncoder.matches(
                request.getPassword(),
                user.getPassword()
        )) {
            throw new RuntimeException(
                    "Số điện thoại hoặc mật khẩu không chính xác!"
            );
        }

        String accessToken = jwtUtil.generateToken(user.getId().toString(), user.getPhone(), user.getRole().getName());
        RefreshToken refreshToken =
                refreshTokenService.createRefreshToken(
                        user.getId()
                );

        return new LoginResponse(
                accessToken,
                refreshToken.getToken(),
                user.getPhone(),
                user.getFullName(),
                user.getRole().getName()
        );
    }

    @Transactional
    public Wallet topUpWallet(com.smart.logistic.dto.TopUpRequest request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("Người dùng không tồn tại!"));

        Wallet wallet = walletRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Tài khoản chưa có ví tiền!"));

        wallet.setBalance(wallet.getBalance().add(request.getAmount()));
        return walletRepository.save(wallet);
    }
}