package com.bougainvillea.backend.controller;

import com.bougainvillea.backend.service.R2StorageService;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/media")
public class MediaController {

    private final R2StorageService r2StorageService;

    public MediaController(R2StorageService r2StorageService) {
        this.r2StorageService = r2StorageService;
    }

    // GET PRESIGNED UPLOAD URL
    @PostMapping("/upload-url")
    public ResponseEntity<?> getUploadUrl(
            @RequestParam("fileName") String fileName,
            @RequestParam("contentType") String contentType) {

        if (fileName == null || fileName.isBlank()) {
            return ResponseEntity.badRequest().body("fileName cannot be empty");
        }

        R2StorageService.PresignedUploadResult result =
                r2StorageService.generatePresignedUploadUrl(fileName, contentType);

        return ResponseEntity.ok(Map.of(
                "fileKey", result.fileKey(),
                "uploadUrl", result.uploadUrl()
        ));
    }
}
