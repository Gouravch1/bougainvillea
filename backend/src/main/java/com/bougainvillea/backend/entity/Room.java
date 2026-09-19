package com.bougainvillea.backend.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.*;


@Entity 
@Table(name = "room")
@Getter
@Setter  
@NoArgsConstructor
@AllArgsConstructor 
@Builder
public class Room {
    @Id 
    @GeneratedValue(strategy = GenerationType.IDENTITY) 
    private Long id;

    private String roomCode;

    private String roomName;

    private boolean isPublic;

    private String roomPassword;

    private LocalDateTime createdAt;

    @ManyToOne
    @JoinColumn(name = "owner_id")
    private User owner;
}
