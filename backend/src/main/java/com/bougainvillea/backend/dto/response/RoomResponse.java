package com.bougainvillea.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter 
@Setter 
@AllArgsConstructor 
public class RoomResponse {
    private String roomCode;
    private String roomName;
    private boolean isPublic;
}
