package com.smart.logistic.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@Getter
@Setter
@ConfigurationProperties(prefix = "app.pagination")
public class PaginationProperties {

    private int defaultPage;
    private int defaultSize;
}