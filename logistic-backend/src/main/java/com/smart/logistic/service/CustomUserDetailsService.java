package com.smart.logistic.service;

import com.smart.logistic.entity.User;
import com.smart.logistic.repository.UserRepository;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;

@Service
public class CustomUserDetailsService
        implements UserDetailsService {

    private final UserRepository userRepository;

    public CustomUserDetailsService(
            UserRepository userRepository
    ) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(
            String phone
    ) throws UsernameNotFoundException {

        User user = userRepository.findByPhone(phone)
                .orElseThrow(() ->
                        new UsernameNotFoundException(
                                "User không tồn tại"
                        ));

        return org.springframework.security.core.userdetails.User
                .builder()
                .username(user.getPhone())
                .password(user.getPassword())
                .authorities(user.getRole().getName())
                .build();
    }
}