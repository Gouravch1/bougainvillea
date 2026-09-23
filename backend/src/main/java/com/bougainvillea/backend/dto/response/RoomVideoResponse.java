package com.bougainvillea.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class RoomVideoResponse {
    private String roomCode;
    private String videoKey;
    private String videoUrl;
}
