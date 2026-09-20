package com.bougainvillea.backend.dto.request;

import lombok.Getter;
import lombok.Setter;

@Getter 
@Setter 
public class JoinRoomRequest {
    private String roomCode;
    private String password;
}
