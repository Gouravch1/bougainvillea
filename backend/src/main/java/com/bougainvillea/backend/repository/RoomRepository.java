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

    // Rooms where host heartbeat is stale AND room is older than 5 minutes (grace period for new rooms)
    @Query("SELECT r FROM Room r WHERE r.createdAt < :graceCutoff AND (r.lastHostHeartbeat IS NULL OR r.lastHostHeartbeat < :cutoff)")
    List<Room> findAbandonedRooms(@Param("cutoff") LocalDateTime cutoff, @Param("graceCutoff") LocalDateTime graceCutoff);
}
