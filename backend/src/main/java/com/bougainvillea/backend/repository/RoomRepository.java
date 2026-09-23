package com.bougainvillea.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.bougainvillea.backend.entity.Room;


@Repository 
public interface RoomRepository extends JpaRepository<Room , Long> {
    Optional<Room> findByRoomCode(String code);

    boolean existsByRoomCode(String code);

    List<Room> findByIsPublicTrue();
}

