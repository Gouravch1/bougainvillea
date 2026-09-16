package com.bougainvillea.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Builder 
@Getter 
@AllArgsConstructor
public class UserResponse {
    private Long id;
    private String username;
    private String email;
}
