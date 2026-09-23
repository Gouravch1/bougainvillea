package com.bougainvillea.backend.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter 
@Setter 
@AllArgsConstructor 
public class RoomResponse {
    private String roomCode;
    private String roomName;

    @JsonProperty("isPublic")
    private boolean isPublic;
}
