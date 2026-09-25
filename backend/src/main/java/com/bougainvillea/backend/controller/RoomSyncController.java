package com.bougainvillea.backend.controller;

import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import com.bougainvillea.backend.dto.websocket.ChatMessage;
import com.bougainvillea.backend.dto.websocket.SyncMessage;

@Controller
public class RoomSyncController {

    private final SimpMessagingTemplate messagingTemplate;

    public RoomSyncController(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    @MessageMapping("/room/{roomCode}/sync")
    public void handleSync(
            @DestinationVariable String roomCode,
            @Payload SyncMessage message) {
        
        if (message.getTimestamp() == null || message.getTimestamp() == 0) {
            message.setTimestamp(System.currentTimeMillis());
        }

      
        messagingTemplate.convertAndSend("/topic/room/" + roomCode + "/sync", message);
    }

    
    @MessageMapping("/room/{roomCode}/chat")
    public void handleChat(
            @DestinationVariable String roomCode,
            @Payload ChatMessage message) {

        if (message.getTimestamp() == null || message.getTimestamp() == 0) {
            message.setTimestamp(System.currentTimeMillis());
        }

        messagingTemplate.convertAndSend("/topic/room/" + roomCode + "/chat", message);
    }
}
