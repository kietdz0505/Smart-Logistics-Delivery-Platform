package com.smart.logistic.repository;

import com.smart.logistic.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
    // Kiểm tra trùng số điện thoại khi đăng ký
    boolean existsByPhone(String phone);
    Optional<User> findByPhone(String phone);
    Optional<User> findById(UUID id);
}