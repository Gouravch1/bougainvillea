package com.bougainvillea.backend.dto.websocket;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SyncMessage {
    private SyncAction action;
    private Double currentTime; // in seconds
    @Builder.Default
    private Double playbackRate = 1.0;
    private String sender;
    private Long timestamp;
}
