package com.bougainvillea.backend.dto.websocket;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessage {
    public enum MessageType {
        CHAT,
        JOIN,
        LEAVE
    }

    private String sender;
    private String content;
    private MessageType type;
    private Long timestamp;
}
