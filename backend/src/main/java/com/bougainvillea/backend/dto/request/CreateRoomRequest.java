package com.bougainvillea.backend.dto.request;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter 
@Setter 
@Builder 
public class CreateRoomRequest {
    private String roomName;
    private boolean isPublic;
    private String roomPassword;
}
