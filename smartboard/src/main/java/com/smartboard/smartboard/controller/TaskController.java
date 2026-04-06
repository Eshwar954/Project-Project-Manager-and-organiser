package com.smartboard.smartboard.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.smartboard.smartboard.dto.TaskRequest;
import com.smartboard.smartboard.entity.Task;
import com.smartboard.smartboard.repository.UserRepository;
import com.smartboard.smartboard.services.TaskService;

import lombok.RequiredArgsConstructor;

// TaskController.java
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class TaskController {
    private final TaskService taskService;
    private final UserRepository userRepository;

    private Long getCurrentUserId() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found")).getId();
    }

    @GetMapping("/projects/{id}/tasks")
    public ResponseEntity<List<Task>> getTasks(@PathVariable Long id) {
        return ResponseEntity.ok(taskService.getProjectTasks(id));
    }

    @PostMapping("/projects/{id}/tasks")
    public ResponseEntity<Task> createTask(@PathVariable Long id, @RequestBody TaskRequest req) {
        return ResponseEntity.ok(taskService.createTask(id, req, getCurrentUserId()));
    }

    @PutMapping("/tasks/{id}/complete")
    public ResponseEntity<Task> complete(@PathVariable Long id) {
        return ResponseEntity.ok(taskService.completeTask(id));
    }

    @PutMapping("/tasks/{id}/assign")
    public ResponseEntity<Task> assign(@PathVariable Long id, @RequestBody Map<String, Long> body) {
        return ResponseEntity.ok(taskService.assignTask(id, body.get("userId"), getCurrentUserId()));
    }
}
