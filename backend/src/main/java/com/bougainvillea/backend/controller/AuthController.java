package com.bougainvillea.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.bougainvillea.backend.dto.request.LoginRequest;
import com.bougainvillea.backend.dto.request.RegisterRequest;
import com.bougainvillea.backend.dto.response.AuthResponse;
import com.bougainvillea.backend.dto.response.UserResponse;
import com.bougainvillea.backend.service.AuthService;

import jakarta.validation.Valid;

@RestController 
@RequestMapping("/api/auth")
public class AuthController {
    
    @Autowired 
    private AuthService authService;

    // Registration
    @PostMapping("/register")
    public ResponseEntity<UserResponse> register(@Valid @RequestBody RegisterRequest request){
        UserResponse response = authService.register(request);
        return ResponseEntity.ok(response);
    }

    // Login
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        String token = authService.login(request);
        return ResponseEntity.ok(new AuthResponse(token));
    }



}
