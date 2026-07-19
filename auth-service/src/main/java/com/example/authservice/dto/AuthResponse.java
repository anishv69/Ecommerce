package com.example.authservice.dto;

import lombok.*;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
public class AuthResponse {
    private String token;
    private String username;
}