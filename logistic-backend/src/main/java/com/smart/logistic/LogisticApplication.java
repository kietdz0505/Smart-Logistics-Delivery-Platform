package com.smart.logistic;

import com.smart.logistic.config.PaginationProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

@SpringBootApplication
@EnableConfigurationProperties(PaginationProperties.class)
public class LogisticApplication {

	public static void main(String[] args) {
		SpringApplication.run(LogisticApplication.class, args);
	}

}
