package com.smart.logistic.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig {

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/api/**") // Áp dụng cho tất cả các đường dẫn API
                        .allowedOrigins("http://localhost:5173") // Cho phép Frontend Vite truy cập
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS") // Các phương thức được phép
                        .allowedHeaders("*") // Chấp nhận tất cả các định dạng Header (bao gồm Authorization Token)
                        .allowCredentials(true); // Cho phép gửi kèm Cookie/Xác thực nếu cần
            }
        };
    }
}