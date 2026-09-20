package com.bougainvillea.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.bougainvillea.backend.dto.request.CreateRoomRequest;
import com.bougainvillea.backend.dto.request.JoinRoomRequest;
import com.bougainvillea.backend.dto.response.RoomResponse;
import com.bougainvillea.backend.service.RoomService;

@RestController
@RequestMapping("/rooms")
public class RoomController {
    private final RoomService roomService;

    public RoomController(RoomService roomService) {
        this.roomService = roomService;
    }

    // POST -> CREATE ROOM
    @PostMapping("/create")
    public ResponseEntity<RoomResponse> createRoom(@RequestBody CreateRoomRequest createRoomRequest,
            Authentication authentication) {
        return ResponseEntity.ok(roomService.createRoom(createRoomRequest, authentication.getName()));
    }

    // POST -> JOIN ROOM
    @PostMapping("/join")
    public ResponseEntity<String> joinRoom(@RequestBody JoinRoomRequest request, Authentication authentication) {
        roomService.joinRoom(request, authentication.getName());
        return ResponseEntity.ok("You've joined the room");
    }

    // DELETE -> LEAVE ROOM (member leaves by themselves)
    @DeleteMapping("/{roomCode}/leave")
    public ResponseEntity<String> leaveRoom(@PathVariable String roomCode, Authentication authentication) {
        roomService.leaveRoom(roomCode, authentication.getName());
        return ResponseEntity.ok("You've left the room");
    }

    // DELETE -> DELETE ROOM (owner only)
    @DeleteMapping("/{roomCode}")
    public ResponseEntity<String> deleteRoom(@PathVariable String roomCode, Authentication authentication) {
        roomService.deleteRoom(roomCode, authentication.getName());
        return ResponseEntity.ok("Room deleted successfully");
    }

    // DELETE -> KICK MEMBER (owner only)
    @DeleteMapping("/{roomCode}/kick/{userId}")
    public ResponseEntity<String> kickMember(@PathVariable String roomCode,
                                             @PathVariable Long userId,
                                             Authentication authentication) {
        roomService.kickMember(roomCode, userId, authentication.getName());
        return ResponseEntity.ok("Member kicked successfully");
    }
}
