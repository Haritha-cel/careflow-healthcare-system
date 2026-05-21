package com.medical.careflow.exception;

import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.validation.FieldError; // ✅ NEW IMPORT
import org.springframework.web.bind.MethodArgumentNotValidException; // ✅ NEW IMPORT
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors; // ✅ NEW IMPORT

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    // ✅ NEW: Handle DTO Validation Errors (@Valid failures)
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<?> handleValidationErrors(MethodArgumentNotValidException ex) {
        // Extract all field errors and format them nicely
        List<String> errors = ex.getBindingResult().getFieldErrors()
                .stream()
                .map(error -> error.getField() + ": " + error.getDefaultMessage())
                .toList();

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                "success", false,
                "message", "Validation failed",
                "errors", errors
        ));
    }

    // Handle resources not found (Returns 404)
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<?> handleResourceNotFound(ResourceNotFoundException e, HttpServletRequest request) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                "success", false,
                "message", e.getMessage()
        ));
    }

    // Handle bad requests / custom exceptions (Returns 400)
    @ExceptionHandler(BadRequestException.class)
    public ResponseEntity<?> handleBadRequest(BadRequestException e, HttpServletRequest request) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                "success", false,
                "message", e.getMessage()
        ));
    }

    // Handle missing request parameters (Returns 400)
    @ExceptionHandler(MissingServletRequestParameterException.class)
    public ResponseEntity<?> handleMissingParams(MissingServletRequestParameterException e) {
        return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "Missing required parameter: " + e.getParameterName()
        ));
    }

    // Handle Spring Security access denied (Returns 403)
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<?> handleAccessDenied(AccessDeniedException e, HttpServletRequest request) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of(
                "success", false,
                "message", "You do not have permission to perform this action"
        ));
    }

    // Catch-all for unexpected errors (Returns 500)
    @ExceptionHandler(Exception.class)
    public ResponseEntity<?> handleAllExceptions(Exception e, HttpServletRequest request) {
        logger.error("❌ Internal error on {}: {}", request.getRequestURI(), e.getMessage(), e);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "success", false,
                "message", "An internal error occurred. Please try again later.",
                "timestamp", Instant.now().toString()
        ));
    }
}