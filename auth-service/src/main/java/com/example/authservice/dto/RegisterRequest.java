package com.example.authservice.dto;

import lombok.*;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
public class RegisterRequest {
    private String username;
    private String password;
    private String email;
}