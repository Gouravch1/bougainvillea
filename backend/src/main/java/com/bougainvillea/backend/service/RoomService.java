package com.bougainvillea.backend.service;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.bougainvillea.backend.dto.request.CreateRoomRequest;
import com.bougainvillea.backend.dto.request.JoinRoomRequest;
import com.bougainvillea.backend.dto.response.RoomResponse;
import com.bougainvillea.backend.dto.response.RoomVideoResponse;
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
    private final R2StorageService r2StorageService;

    public RoomService(RoomRepository roomRepository,
                       UserRepository userRepository,
                       RandomCodeGenerator randomCodeGenerator,
                       RoomMemberRepository roomMemberRepository,
                       R2StorageService r2StorageService
    ) {
        this.roomRepository = roomRepository;
        this.userRepository = userRepository;
        this.randomCodeGenerator = randomCodeGenerator;
        this.roomMemberRepository = roomMemberRepository;
        this.r2StorageService = r2StorageService;
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

        // Add owner as the first room member so owner appears in member list
        RoomMembers ownerMember = new RoomMembers();
        ownerMember.setRoom(room);
        ownerMember.setUser(owner);
        ownerMember.setJoinedAt(LocalDateTime.now());
        roomMemberRepository.save(ownerMember);

        return new RoomResponse(room.getRoomCode(), room.getRoomName(), room.isPublic());
    }

    // JOIN ROOM
    public void joinRoom(JoinRoomRequest request, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email));
        Room room = roomRepository.findByRoomCode(request.getRoomCode())
                .orElseThrow(() -> new RuntimeException("Room not found: " + request.getRoomCode()));

        if (room.getOwner().getEmail().equals(email) || roomMemberRepository.existsByRoomAndUser(room, user)) {
            throw new RuntimeException("You are already in this room");
        }

        // Verify password for private rooms
        if (!room.isPublic()) {
            if (request.getPassword() == null || !request.getPassword().equals(room.getRoomPassword())) {
                throw new RuntimeException("Invalid room password");
            }
        }

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

        // Clean up video from R2 when deleting room
        if (room.getVideoKey() != null && !room.getVideoKey().isBlank()) {
            r2StorageService.deleteFile(room.getVideoKey());
        }

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

    // GET ROOM MEMBERS (Only members/owner)
   public List<RoomMembers> getAllMembers(String roomCode, String email) {
    User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found: " + email));

    Room room = roomRepository.findByRoomCode(roomCode)
            .orElseThrow(() -> new RuntimeException("Room not found: " + roomCode));

    boolean isOwner = room.getOwner().getEmail().equals(email);
    boolean isMember = roomMemberRepository.existsByRoomAndUser(room, user);

    if (!isOwner && !isMember) {
        throw new RuntimeException("You must be a member of the room to view member list");
    }

    return roomMemberRepository.findByRoom(room);
    }

    // GET ALL PUBLIC ROOMS
    public List<RoomResponse> getAllPublicRooms() {
        return roomRepository.findByIsPublicTrue()
                .stream()
                .map(room -> new RoomResponse(room.getRoomCode(), room.getRoomName(), room.isPublic()))
                .toList();
    }

    // UPLOAD / UPDATE ROOM VIDEO (Members or Owner)
    @Transactional
    public RoomVideoResponse uploadRoomVideo(String roomCode, MultipartFile file, String email) throws IOException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email));

        Room room = roomRepository.findByRoomCode(roomCode)
                .orElseThrow(() -> new RuntimeException("Room not found: " + roomCode));

        boolean isOwner = room.getOwner().getEmail().equals(email);
        boolean isMember = roomMemberRepository.existsByRoomAndUser(room, user);

        if (!isOwner && !isMember) {
            throw new RuntimeException("You must be a member or owner of this room to upload a video");
        }

        // Clean up previous video from R2 if one existed
        if (room.getVideoKey() != null && !room.getVideoKey().isBlank()) {
            r2StorageService.deleteFile(room.getVideoKey());
        }

        String newVideoKey = r2StorageService.uploadFile(file);
        room.setVideoKey(newVideoKey);
        roomRepository.save(room);

        String presignedUrl = r2StorageService.generatePresignedUrl(newVideoKey);
        return new RoomVideoResponse(roomCode, newVideoKey, presignedUrl);
    }

    // GET ROOM VIDEO PRESIGNED URL (Members, Owner, or Public Room)
    public RoomVideoResponse getRoomVideo(String roomCode, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email));

        Room room = roomRepository.findByRoomCode(roomCode)
                .orElseThrow(() -> new RuntimeException("Room not found: " + roomCode));

        boolean isOwner = room.getOwner().getEmail().equals(email);
        boolean isMember = roomMemberRepository.existsByRoomAndUser(room, user);

        if (!room.isPublic() && !isOwner && !isMember) {
            throw new RuntimeException("You must be a member of this room to access its video");
        }

        if (room.getVideoKey() == null || room.getVideoKey().isBlank()) {
            return new RoomVideoResponse(roomCode, null, null);
        }

        String presignedUrl = r2StorageService.generatePresignedUrl(room.getVideoKey());
        return new RoomVideoResponse(roomCode, room.getVideoKey(), presignedUrl);
    }

    // DELETE ROOM VIDEO (Members or Owner)
    @Transactional
    public void deleteRoomVideo(String roomCode, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email));

        Room room = roomRepository.findByRoomCode(roomCode)
                .orElseThrow(() -> new RuntimeException("Room not found: " + roomCode));

        boolean isOwner = room.getOwner().getEmail().equals(email);
        boolean isMember = roomMemberRepository.existsByRoomAndUser(room, user);

        if (!isOwner && !isMember) {
            throw new RuntimeException("You must be a member or owner of this room to delete the video");
        }

        if (room.getVideoKey() != null && !room.getVideoKey().isBlank()) {
            r2StorageService.deleteFile(room.getVideoKey());
            room.setVideoKey(null);
            roomRepository.save(room);
        }
    }
}
