package com.example.apigateway;

import org.springframework.cloud.client.discovery.DiscoveryClient;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/internal")
public class ReadinessController {

    private static final List<String> REQUIRED_SERVICES = List.of(
            "product-service",
            "cart-service",
            "auth-service"
    );

    private final DiscoveryClient discoveryClient;

    public ReadinessController(DiscoveryClient discoveryClient) {
        this.discoveryClient = discoveryClient;
    }

    @GetMapping("/readiness")
    public ResponseEntity<Map<String, Object>> readiness() {
        Map<String, Boolean> services = new LinkedHashMap<>();
        for (String service : REQUIRED_SERVICES) {
            services.put(service, !discoveryClient.getInstances(service).isEmpty());
        }

        boolean ready = services.values().stream().allMatch(Boolean.TRUE::equals);
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("status", ready ? "UP" : "STARTING");
        response.put("services", services);

        return ResponseEntity.status(ready ? HttpStatus.OK : HttpStatus.SERVICE_UNAVAILABLE)
                .body(response);
    }
}
