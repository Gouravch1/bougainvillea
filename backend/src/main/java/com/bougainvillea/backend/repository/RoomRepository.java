package com.bougainvillea.backend.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.bougainvillea.backend.entity.Room;

@Repository
public interface RoomRepository extends JpaRepository<Room, Long> {
    Optional<Room> findByRoomCode(String code);

    boolean existsByRoomCode(String code);

    List<Room> findByIsPublicTrue();

    // Rooms older than cutoff (e.g. 12 hours) for background cleanup
    @Query("SELECT r FROM Room r WHERE r.createdAt < :cutoff")
    List<Room> findStaleRooms(@Param("cutoff") LocalDateTime cutoff);
}
