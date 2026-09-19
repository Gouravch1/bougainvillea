package com.bougainvillea.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.bougainvillea.backend.dto.request.CreateRoomRequest;
import com.bougainvillea.backend.dto.response.RoomResponse;
import com.bougainvillea.backend.service.RoomService;

@RestController 
@RequestMapping ("/rooms")
public class RoomController {
    private final RoomService roomService;

    public RoomController(RoomService roomService){
        this.roomService = roomService;
    }

    // POST -> CREATE ROOM
   @PostMapping("/create")
   public ResponseEntity<RoomResponse> createRoom(@RequestBody CreateRoomRequest createRoomRequest ,Authentication authentication){
        String username = authentication.getName();

        return ResponseEntity.ok(roomService.createRoom(createRoomRequest, username));
   }
}
