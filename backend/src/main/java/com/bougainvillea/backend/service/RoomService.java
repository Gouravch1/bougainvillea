package com.bougainvillea.backend.service;

import java.time.LocalDateTime;

import org.springframework.stereotype.Service;

import com.bougainvillea.backend.dto.request.CreateRoomRequest;
import com.bougainvillea.backend.dto.response.RoomResponse;
import com.bougainvillea.backend.entity.Room;
import com.bougainvillea.backend.entity.User;
import com.bougainvillea.backend.repository.RoomRepository;
import com.bougainvillea.backend.repository.UserRepository;
import com.bougainvillea.backend.util.RandomCodeGenerator;

@Service 
public class RoomService {
    private final RoomRepository roomRepository;
    private final UserRepository userRepository;
    private final RandomCodeGenerator randomCodeGenerator;

    public RoomService(RoomRepository roomRepository,
                       UserRepository userRepository,
                       RandomCodeGenerator randomCodeGenerator      
    ){
        this.roomRepository = roomRepository;
        this.userRepository = userRepository;
        this.randomCodeGenerator = randomCodeGenerator;
    }

    public RoomResponse createRoom(CreateRoomRequest request, String email) {
        User owner = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email));

        String roomCode;
        do{
            roomCode = randomCodeGenerator.generateCode();
        }
        while(
            roomRepository.existsByRoomCode(roomCode)
        );

        Room room = new Room();
        room.setRoomCode(roomCode);
        room.setRoomName(request.getRoomName());
        room.setPublic(request.isPublic());
        room.setRoomPassword(request.getRoomPassword());
        room.setCreatedAt(LocalDateTime.now());
        room.setOwner(owner);

        roomRepository.save(room);

        return new RoomResponse(room.getRoomCode(), room.getRoomName(), room.isPublic());
    }
}
