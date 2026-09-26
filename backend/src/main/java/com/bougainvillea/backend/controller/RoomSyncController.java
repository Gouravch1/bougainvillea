package com.bougainvillea.backend.controller;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import com.bougainvillea.backend.dto.websocket.ChatMessage;
import com.bougainvillea.backend.dto.websocket.SyncAction;
import com.bougainvillea.backend.dto.websocket.SyncMessage;

@Controller
public class RoomSyncController {

    private final SimpMessagingTemplate messagingTemplate;
    // In-memory playback state per room so late joiners catch up instantly
    private final Map<String, SyncMessage> playbackStates = new ConcurrentHashMap<>();

    public RoomSyncController(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    @MessageMapping("/room/{roomCode}/sync")
    public void handleSync(
            @DestinationVariable String roomCode,
            @Payload SyncMessage message) {
        
        long now = System.currentTimeMillis();
        if (message.getTimestamp() == null || message.getTimestamp() == 0) {
            message.setTimestamp(now);
        }

        if (message.getAction() == SyncAction.SYNC_REQUEST) {
            // If backend already has the active playback state, calculate current live time and respond
            SyncMessage current = playbackStates.get(roomCode);
            if (current != null) {
                double liveTime = current.getCurrentTime() != null ? current.getCurrentTime() : 0.0;
                if (current.getAction() == SyncAction.PLAY) {
                    double elapsedSeconds = (now - current.getTimestamp()) / 1000.0;
                    double rate = current.getPlaybackRate() != null ? current.getPlaybackRate() : 1.0;
                    liveTime += (elapsedSeconds * rate);
                }

                SyncMessage instantCatchup = SyncMessage.builder()
                        .action(current.getAction() == SyncAction.PLAY ? SyncAction.PLAY : SyncAction.PAUSE)
                        .currentTime(liveTime)
                        .playbackRate(current.getPlaybackRate())
                        .sender("SERVER")
                        .timestamp(now)
                        .build();

                messagingTemplate.convertAndSend("/topic/room/" + roomCode + "/sync", instantCatchup);
            }
            // Also forward so host can also sync if needed
            messagingTemplate.convertAndSend("/topic/room/" + roomCode + "/sync", message);
            return;
        }

        // Store state for PLAY, PAUSE, SEEK, SPEED_CHANGE
        if (message.getAction() == SyncAction.PLAY ||
            message.getAction() == SyncAction.PAUSE ||
            message.getAction() == SyncAction.SEEK ||
            message.getAction() == SyncAction.SPEED_CHANGE) {
            playbackStates.put(roomCode, message);
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
