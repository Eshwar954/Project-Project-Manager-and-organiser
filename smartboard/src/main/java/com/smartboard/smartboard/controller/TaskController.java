package com.smartboard.smartboard.controller;

import java.util.List;
import java.util.Map;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import com.smartboard.smartboard.dto.CommentRequest;
import com.smartboard.smartboard.dto.CommentResponse;
import com.smartboard.smartboard.dto.TaskRequest;
import com.smartboard.smartboard.entity.Task;
import com.smartboard.smartboard.repository.UserRepository;
import com.smartboard.smartboard.services.TaskService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class TaskController {

    private final TaskService    taskService;
    private final UserRepository userRepository;

    private Long getCurrentUserId() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"))
                .getId();
    }

    // ── Tasks ─────────────────────────────────────────────────────────────────

    /** GET /api/projects/{id}/tasks */
    @GetMapping("/projects/{id}/tasks")
    public ResponseEntity<List<Task>> getTasks(@PathVariable Long id) {
        return ResponseEntity.ok(taskService.getProjectTasks(id));
    }

    /** POST /api/projects/{id}/tasks — admin only */
    @PostMapping("/projects/{id}/tasks")
    public ResponseEntity<Task> createTask(
            @PathVariable Long id,
            @Valid @RequestBody TaskRequest req
    ) {
        return ResponseEntity.ok(taskService.createTask(id, req, getCurrentUserId()));
    }

    /** PUT /api/tasks/{id}/complete */
    @PutMapping("/tasks/{id}/complete")
    public ResponseEntity<Task> complete(@PathVariable Long id) {
        return ResponseEntity.ok(taskService.completeTask(id));
    }

    /** PUT /api/tasks/{id}/assign — admin only */
    @PutMapping("/tasks/{id}/assign")
    public ResponseEntity<Task> assign(
            @PathVariable Long id,
            @RequestBody Map<String, Long> body
    ) {
        return ResponseEntity.ok(taskService.assignTask(id, body.get("userId"), getCurrentUserId()));
    }

    // ── Comments ──────────────────────────────────────────────────────────────

    /** GET /api/tasks/{id}/comments */
    @GetMapping("/tasks/{id}/comments")
    public ResponseEntity<List<CommentResponse>> getComments(@PathVariable Long id) {
        return ResponseEntity.ok(taskService.getComments(id));
    }

    /** POST /api/tasks/{id}/comments */
    @PostMapping("/tasks/{id}/comments")
    public ResponseEntity<CommentResponse> addComment(
            @PathVariable Long id,
            @Valid @RequestBody CommentRequest req
    ) {
        return ResponseEntity.ok(taskService.addComment(id, req, getCurrentUserId()));
    }
}
