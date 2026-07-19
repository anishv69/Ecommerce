package com.example.authservice.service;

import com.example.authservice.dto.AuthResponse;
import com.example.authservice.dto.LoginRequest;
import com.example.authservice.dto.RegisterRequest;
import com.example.authservice.model.User;
import com.example.authservice.repository.UserRepository;
import com.example.authservice.security.JwtUtil;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository repository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;

    public AuthService(UserRepository repository,
                       PasswordEncoder passwordEncoder,
                       JwtUtil jwtUtil,
                       AuthenticationManager authenticationManager) {
        this.repository = repository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.authenticationManager = authenticationManager;
    }

    public AuthResponse register(RegisterRequest request) {
        if (repository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username already taken");
        }
        if (repository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already taken");
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setEmail(request.getEmail());
        user.setRole("ROLE_USER");

        repository.save(user);

        String token = jwtUtil.generateToken(request.getUsername());
        return new AuthResponse(token, request.getUsername());
    }

    public AuthResponse login(LoginRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getUsername(),
                            request.getPassword()
                    )
            );
        } catch (Exception e) {
            System.out.println("AUTH ERROR TYPE: " + e.getClass().getName());
            System.out.println("AUTH ERROR MSG: " + e.getMessage());
            if (e.getCause() != null) {
                System.out.println("AUTH ERROR CAUSE: " + e.getCause().getMessage());
            }
            throw new RuntimeException(e.getClass().getName() + ": " + e.getMessage());
        }

        String token = jwtUtil.generateToken(request.getUsername());
        return new AuthResponse(token, request.getUsername());
    }
}