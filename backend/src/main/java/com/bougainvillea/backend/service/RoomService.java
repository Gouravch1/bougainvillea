package com.bougainvillea.backend.service;

import java.time.LocalDateTime;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.bougainvillea.backend.dto.request.CreateRoomRequest;
import com.bougainvillea.backend.dto.request.JoinRoomRequest;
import com.bougainvillea.backend.dto.response.RoomResponse;
import com.bougainvillea.backend.entity.Room;
import com.bougainvillea.backend.entity.RoomMembers;
import com.bougainvillea.backend.entity.User;
import com.bougainvillea.backend.repository.RoomMemberRepository;
import com.bougainvillea.backend.repository.RoomRepository;
import com.bougainvillea.backend.repository.UserRepository;
import com.bougainvillea.backend.util.RandomCodeGenerator;

@Service
public class RoomService {
    private final RoomRepository roomRepository;
    private final UserRepository userRepository;
    private final RandomCodeGenerator randomCodeGenerator;
    private final RoomMemberRepository roomMemberRepository;

    public RoomService(RoomRepository roomRepository,
                       UserRepository userRepository,
                       RandomCodeGenerator randomCodeGenerator,
                       RoomMemberRepository roomMemberRepository
    ) {
        this.roomRepository = roomRepository;
        this.userRepository = userRepository;
        this.randomCodeGenerator = randomCodeGenerator;
        this.roomMemberRepository = roomMemberRepository;
    }

    // CREATE ROOM
    public RoomResponse createRoom(CreateRoomRequest request, String email) {
        User owner = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email));

        String roomCode;
        do {
            roomCode = randomCodeGenerator.generateCode();
        } while (roomRepository.existsByRoomCode(roomCode));

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

    // JOIN ROOM
    public void joinRoom(JoinRoomRequest request, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email));
        Room room = roomRepository.findByRoomCode(request.getRoomCode())
                .orElseThrow(() -> new RuntimeException("Room not found: " + request.getRoomCode()));
        if (roomMemberRepository.existsByRoomAndUser(room, user))
            throw new RuntimeException("You've already joined the room");

        RoomMembers roomMember = new RoomMembers();
        roomMember.setRoom(room);
        roomMember.setUser(user);
        roomMember.setJoinedAt(LocalDateTime.now());
        roomMemberRepository.save(roomMember);
    }

    // LEAVE ROOM  (member leaves by themselves)
    @Transactional
    public void leaveRoom(String roomCode, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email));
        Room room = roomRepository.findByRoomCode(roomCode)
                .orElseThrow(() -> new RuntimeException("Room not found: " + roomCode));
        if (room.getOwner().getEmail().equals(email))
            throw new RuntimeException("Owner cannot leave the room. Delete the room instead.");

        RoomMembers member = roomMemberRepository.findByRoomAndUser(room, user)
                .orElseThrow(() -> new RuntimeException("You are not a member of this room"));
        roomMemberRepository.delete(member);
    }

    // DELETE ROOM  (only owner)
    @Transactional
    public void deleteRoom(String roomCode, String email) {
        User owner = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email));
        Room room = roomRepository.findByRoomCode(roomCode)
                .orElseThrow(() -> new RuntimeException("Room not found: " + roomCode));

        if (!room.getOwner().getEmail().equals(email))
            throw new RuntimeException("Only the room owner can delete this room");

        roomMemberRepository.deleteAllByRoom(room);
        roomRepository.delete(room);
    }

    // KICK MEMBER  (only owner, cannot kick themselves)
    @Transactional
    public void kickMember(String roomCode, Long targetUserId, String ownerEmail) {
        User owner = userRepository.findByEmail(ownerEmail)
                .orElseThrow(() -> new RuntimeException("User not found: " + ownerEmail));
        Room room = roomRepository.findByRoomCode(roomCode)
                .orElseThrow(() -> new RuntimeException("Room not found: " + roomCode));

        if (!room.getOwner().getEmail().equals(ownerEmail))
            throw new RuntimeException("Only the room owner can kick members");

        User target = userRepository.findById(targetUserId)
                .orElseThrow(() -> new RuntimeException("Target user not found: " + targetUserId));

        if (target.getEmail().equals(ownerEmail))
            throw new RuntimeException("You cannot kick yourself");

        RoomMembers member = roomMemberRepository.findByRoomAndUser(room, target)
                .orElseThrow(() -> new RuntimeException("User is not a member of this room"));
        roomMemberRepository.delete(member);
    }
}
