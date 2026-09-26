package com.bougainvillea.backend.service;

import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.bougainvillea.backend.dto.request.LoginRequest;
import com.bougainvillea.backend.dto.request.RegisterRequest;
import com.bougainvillea.backend.dto.response.UserResponse;
import com.bougainvillea.backend.entity.User;
import com.bougainvillea.backend.repository.UserRepository;
import com.bougainvillea.backend.util.JwtUtil;

import lombok.extern.slf4j.Slf4j;

@Service    
public class AuthService {
    
    @Autowired 
    private UserRepository userRepository;

    @Autowired 
    private PasswordEncoder passwordEncoder;

    @Autowired 
    private JwtUtil jwtUtil;
    
    // Register User 
    public UserResponse register(RegisterRequest registerRequest){

        if(userRepository.existsByUsername(registerRequest.getUsername())){
             throw new RuntimeException("username must be unique");
        }

        if(userRepository.existsByEmail(registerRequest.getEmail())){
            throw new RuntimeException("email already exists");
        }
        
        String encodedPassword = passwordEncoder.encode(registerRequest.getPassword());

        User user = User.builder()
                        .username(registerRequest.getUsername())
                        .email(registerRequest.getEmail())
                        .password(encodedPassword)
                        .build();
        
        userRepository.save(user);

        return UserResponse.builder()
                            .id(user.getId())
                            .username(user.getUsername())
                            .email(user.getEmail())
                            .build();
    }

    // Login 
    public String login(LoginRequest request){
        User user = userRepository.findByEmail(request.getEmail()).orElseThrow(() -> new RuntimeException("Invalid email or password"));

        boolean passwordMatches = passwordEncoder.matches(request.getPassword(), user.getPassword());

        if (!passwordMatches) {
            throw new RuntimeException("Invalid email or password");
        }

        return jwtUtil.generateToken(user.getEmail());
    }

}
