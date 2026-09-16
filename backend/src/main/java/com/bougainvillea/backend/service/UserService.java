package com.bougainvillea.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.bougainvillea.backend.dto.response.UserResponse;
import com.bougainvillea.backend.entity.User;
import com.bougainvillea.backend.repository.UserRepository;

@Service 
public class UserService {

    @Autowired 
    private UserRepository userRepository;

    public UserResponse response(String email){
        User user = userRepository.findByEmail(email).orElseThrow( () -> new RuntimeException("email/user not found"));

        return UserResponse.builder()
                    .id(user.getId())
                    .username(user.getUsername())
                    .email(user.getEmail())
                    .build();

    }
    
}
