package com.bougainvillea.backend.exception;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, String>> handleRuntimeException(RuntimeException ex) {
        Map<String, String> error = new HashMap<>();
        error.put("error", ex.getMessage());

        String msg = ex.getMessage() != null ? ex.getMessage().toLowerCase() : "";

        HttpStatus status;
        if (msg.contains("not found")) {
            status = HttpStatus.NOT_FOUND;                  // 404
        } else if (msg.contains("only") || msg.contains("cannot") || msg.contains("must be")) {
            status = HttpStatus.FORBIDDEN;                  // 403
        } else if (msg.contains("already") || msg.contains("invalid") || msg.contains("unique")) {
            status = HttpStatus.CONFLICT;                   // 409
        } else {
            status = HttpStatus.BAD_REQUEST;                // 400
        }

        return ResponseEntity.status(status).body(error);
    }

   
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidationExceptions(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        for (FieldError error : ex.getBindingResult().getFieldErrors()) {
            errors.put(error.getField(), error.getDefaultMessage());
        }
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errors); 
    }


    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> handleGeneralException(Exception ex) {
        Map<String, String> error = new HashMap<>();
        error.put("error", ex.getMessage() != null ? ex.getMessage() : "An unexpected error occurred");
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);  
    }
}
