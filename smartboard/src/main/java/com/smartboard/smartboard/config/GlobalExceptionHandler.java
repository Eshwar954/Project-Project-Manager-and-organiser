package com.smartboard.smartboard.config;

import java.time.Instant;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/**
 * Converts unhandled exceptions into clean JSON error responses
 * so the frontend always receives a predictable error shape.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    /** Handle @Valid / @Validated failures */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidation(MethodArgumentNotValidException ex) {
        String details = ex.getBindingResult().getFieldErrors().stream()
                .map(fe -> fe.getField() + ": " + fe.getDefaultMessage())
                .collect(Collectors.joining(", "));

        return ResponseEntity.badRequest().body(Map.of(
                "error",     "Validation failed",
                "message",   details,
                "timestamp", Instant.now().toString()
        ));
    }

    /** Handle any other RuntimeException */
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, Object>> handleRuntime(RuntimeException ex) {
        HttpStatus status = resolveStatus(ex.getMessage());
        return ResponseEntity.status(status).body(Map.of(
                "error",     status.getReasonPhrase(),
                "message",   ex.getMessage() != null ? ex.getMessage() : "An unexpected error occurred",
                "timestamp", Instant.now().toString()
        ));
    }

    private HttpStatus resolveStatus(String msg) {
        if (msg == null) return HttpStatus.INTERNAL_SERVER_ERROR;
        String lower = msg.toLowerCase();
        if (lower.contains("not found"))                          return HttpStatus.NOT_FOUND;
        if (lower.contains("invalid"))                            return HttpStatus.UNAUTHORIZED;
        if (lower.contains("already"))                            return HttpStatus.CONFLICT;
        if (lower.contains("only admin") || lower.contains("only owner")) return HttpStatus.FORBIDDEN;
        return HttpStatus.BAD_REQUEST;
    }
}
