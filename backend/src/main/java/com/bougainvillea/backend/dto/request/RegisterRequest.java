package com.bougainvillea.backend.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Pattern;
import lombok.Getter;
import lombok.Setter;

@Getter 
@Setter 
public class RegisterRequest {
    
    @NotBlank
    private String username;

    @NotBlank
    @Email  
    private String email;

    @NotBlank(message = "password is required")
    @Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]+$")
    @Size(min = 8 , max = 20 , message = "password must be at least 8 characters and contains atleast one characters from all uppercase , lowercase , numbers & symbols")
    private String password;
    
}
