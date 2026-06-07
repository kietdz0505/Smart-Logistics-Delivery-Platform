package com.smart.logistic.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@EnableWebSecurity
@EnableMethodSecurity
@Configuration
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http, JwtAuthenticationFilter jwtFilter) throws Exception {

        http.csrf(csrf -> csrf.disable()).cors(cors -> cors.configure(http)).sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)).authorizeHttpRequests(auth -> auth

                .requestMatchers("/ws/**").permitAll()

                // AUTH
                .requestMatchers("/api/auth/**").permitAll()

                // CUSTOMER
                .requestMatchers(HttpMethod.POST, "/api/orders/create").hasAuthority("ROLE_CUSTOMER")

                .requestMatchers(HttpMethod.PUT, "/api/orders/customer-cancel").hasAuthority("ROLE_CUSTOMER")

                .requestMatchers(HttpMethod.GET, "/api/orders/customer/history").hasAuthority("ROLE_CUSTOMER")

                .requestMatchers(HttpMethod.GET, "/api/orders/*").hasAnyAuthority("ROLE_CUSTOMER", "ROLE_DRIVER")

                // DRIVER
                .requestMatchers(HttpMethod.GET, "/api/orders/pending").hasAuthority("ROLE_DRIVER")

                .requestMatchers(HttpMethod.PUT, "/api/orders/accept").hasAuthority("ROLE_DRIVER")

                .requestMatchers(HttpMethod.PUT, "/api/orders/start-delivery").hasAuthority("ROLE_DRIVER")

                .requestMatchers(HttpMethod.GET, "/api/orders/driver/active").hasAuthority("ROLE_DRIVER")

                .requestMatchers(HttpMethod.PUT, "/api/orders/complete").hasAuthority("ROLE_DRIVER")

                .requestMatchers(HttpMethod.PUT, "/api/orders/driver-cancel").hasAuthority("ROLE_DRIVER")

                .requestMatchers(HttpMethod.GET, "/api/orders/driver/history").hasAuthority("ROLE_DRIVER")

                .requestMatchers(HttpMethod.GET, "/api/wallets/balance").hasAnyAuthority("ROLE_DRIVER", "ROLE_CUSTOMER")

                .requestMatchers(HttpMethod.GET, "/api/orders/*/nearby-drivers").hasAuthority("ROLE_DRIVER")

                .anyRequest().authenticated());

        http.addFilterBefore(jwtFilter, org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}