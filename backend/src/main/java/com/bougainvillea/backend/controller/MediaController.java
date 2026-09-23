package com.bougainvillea.backend.controller;

import com.bougainvillea.backend.service.R2StorageService;
import java.io.IOException;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/media")
public class MediaController {

    private final R2StorageService r2StorageService;

    public MediaController(R2StorageService r2StorageService) {
        this.r2StorageService = r2StorageService;
    }

    // UPLOAD VIDEO
    @PostMapping("/upload")
    public ResponseEntity<?> uploadVideo(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body("File cannot be empty");
        }

        try {
            String fileKey = r2StorageService.uploadFile(file);
            return ResponseEntity.ok(Map.of(
                "message", "Upload successful",
                "fileKey", fileKey
            ));
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body("Upload failed: " + e.getMessage());
        }
    }
}
