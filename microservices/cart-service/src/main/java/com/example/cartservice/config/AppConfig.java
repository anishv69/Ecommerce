package com.example.cartservice.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.client.RestClient;

@Configuration
public class AppConfig {

    @Bean
    public RestClient restClient(
            @Value("${product-service.base-url:http://localhost:8081}") String productServiceBaseUrl) {
        return RestClient.builder()
                .baseUrl(productServiceBaseUrl)
                .build();
    }
}
