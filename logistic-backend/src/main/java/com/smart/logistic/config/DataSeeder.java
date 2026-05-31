package com.smart.logistic.config;

import com.smart.logistic.entity.DriverProfile;
import com.smart.logistic.entity.Role;
import com.smart.logistic.entity.User;
import com.smart.logistic.entity.Wallet;
import com.smart.logistic.repository.DriverProfileRepository;
import com.smart.logistic.repository.RoleRepository;
import com.smart.logistic.repository.UserRepository;
import com.smart.logistic.repository.WalletRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;

@Component
public class DataSeeder implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final DriverProfileRepository driverProfileRepository;
    private final WalletRepository walletRepository; // <-- Thêm vào đây
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(RoleRepository roleRepository,
                      UserRepository userRepository,
                      DriverProfileRepository driverProfileRepository,
                      WalletRepository walletRepository, // <-- Thêm vào đây
                      PasswordEncoder passwordEncoder) {
        this.roleRepository = roleRepository;
        this.userRepository = userRepository;
        this.driverProfileRepository = driverProfileRepository;
        this.walletRepository = walletRepository; // <-- Thêm vào đây
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        if (roleRepository.count() == 0) {
            List<String> defaultRoles = Arrays.asList("ROLE_ADMIN", "ROLE_CUSTOMER", "ROLE_DRIVER");
            for (String roleName : defaultRoles) {
                Role role = new Role();
                role.setName(roleName);
                roleRepository.save(role);
            }
            System.out.println(">>>>> Đã khởi tạo các dữ liệu Role mẫu! <<<<<");
        }

        if (driverProfileRepository.count() == 0) {
            Role driverRole = roleRepository.findByName("ROLE_DRIVER")
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy ROLE_DRIVER"));

            createMockDriver("0911111111", "Tài Xế Gần", "29A-11111", 105.8537, 21.0252, driverRole);
            createMockDriver("0922222222", "Tài Xế Tầm Trung", "29A-22222", 105.8250, 21.0400, driverRole);
            createMockDriver("0933333333", "Tài Xế Quá Xa", "29A-33333", 105.7781, 21.0284, driverRole);

            System.out.println(">>>>> Đã khởi tạo thành công 3 tài xế mẫu kèm ví tiền không gian! <<<<<");
        }
    }

    private void createMockDriver(String phone, String name, String vehicleNum, double lng, double lat, Role role) {
        User user = new User();
        user.setPhone(phone);
        user.setPassword(passwordEncoder.encode("driver123"));
        user.setFullName(name);
        user.setRole(role);
        User savedUser = userRepository.save(user);

        DriverProfile profile = new DriverProfile();
        profile.setUser(savedUser);
        profile.setVehicleNumber(vehicleNum);
        profile.setVehicleType("BIKE");
        profile.setStatus("AVAILABLE");
        profile.setCurrentLocation(GeometryUtil.createPoint(lng, lat));
        driverProfileRepository.save(profile);

        // KÍCH HOẠT VÍ TIỀN MẪU CHO TÀI XẾ (Sửa lỗi thiếu ví)
        Wallet wallet = new Wallet();
        wallet.setUser(savedUser);
        wallet.setBalance(BigDecimal.ZERO);
        walletRepository.save(wallet);
    }
}