package com.bougainvillea.backend.controller;

import java.io.IOException;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.bougainvillea.backend.dto.request.CreateRoomRequest;
import com.bougainvillea.backend.dto.request.JoinRoomRequest;
import com.bougainvillea.backend.dto.response.RoomResponse;
import com.bougainvillea.backend.dto.response.RoomVideoResponse;
import com.bougainvillea.backend.service.RoomService;
import com.bougainvillea.backend.entity.RoomMembers;

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

    // GET -> GET ROOM MEMBERS
    @GetMapping("/{roomCode}/members")
    public ResponseEntity<List<RoomMembers>> getRoomMembers(@PathVariable String roomCode , Authentication authentication) {
        return ResponseEntity.ok(roomService.getAllMembers(roomCode , authentication.getName()));
    }

    // GET -> GET ALL PUBLIC ROOMS
    @GetMapping("/public")
    public ResponseEntity<List<RoomResponse>> getPublicRooms() {
        return ResponseEntity.ok(roomService.getAllPublicRooms());
    }

    // POST -> UPLOAD VIDEO FOR ROOM
    @PostMapping("/{roomCode}/video")
    public ResponseEntity<RoomVideoResponse> uploadRoomVideo(@PathVariable String roomCode,
                                                             @RequestParam("file") MultipartFile file,
                                                             Authentication authentication) throws IOException {
        return ResponseEntity.ok(roomService.uploadRoomVideo(roomCode, file, authentication.getName()));
    }

    // GET -> GET ROOM VIDEO (Presigned playable URL)
    @GetMapping("/{roomCode}/video")
    public ResponseEntity<RoomVideoResponse> getRoomVideo(@PathVariable String roomCode,
                                                          Authentication authentication) {
        return ResponseEntity.ok(roomService.getRoomVideo(roomCode, authentication.getName()));
    }

    // DELETE -> DELETE ROOM VIDEO
    @DeleteMapping("/{roomCode}/video")
    public ResponseEntity<String> deleteRoomVideo(@PathVariable String roomCode,
                                                  Authentication authentication) {
        roomService.deleteRoomVideo(roomCode, authentication.getName());
        return ResponseEntity.ok("Room video deleted successfully");
    }
}

