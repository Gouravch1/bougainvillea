package com.bougainvillea.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.bougainvillea.backend.entity.Room;
import com.bougainvillea.backend.entity.RoomMembers;
import com.bougainvillea.backend.entity.User;

@Repository
public interface RoomMemberRepository extends JpaRepository<RoomMembers, Long> {
    List<RoomMembers> findByRoom(Room room);
    Optional<RoomMembers> findByRoomAndUser(Room room, User user);
    boolean existsByRoomAndUser(Room room, User user);
    void deleteAllByRoom(Room room);
}
