package com.smartboard.smartboard.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import com.smartboard.smartboard.entity.Task;
import com.smartboard.smartboard.entity.User;
import com.smartboard.smartboard.repository.UserRepository;
import com.smartboard.smartboard.services.UserService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService    userService;
    private final UserRepository userRepository;

    private Long getCurrentUserId() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"))
                .getId();
    }

    /** GET /api/users/me — current user's profile (password hidden by @JsonIgnore) */
    @GetMapping("/me")
    public ResponseEntity<User> profile() {
        return ResponseEntity.ok(userService.getProfile(getCurrentUserId()));
    }

    /**
     * GET /api/users/team — all unique members across all of the current user's projects.
     * Used by the Team page.
     */
    @GetMapping("/team")
    public ResponseEntity<List<User>> team() {
        return ResponseEntity.ok(userService.getTeamMembers(getCurrentUserId()));
    }

    /**
     * GET /api/users/{memberId}/tasks — tasks assigned to a specific member
     * (scoped to projects shared with the requesting user).
     * Used by admin to see who is doing what.
     */
    @GetMapping("/{memberId}/tasks")
    public ResponseEntity<List<Task>> memberTasks(@PathVariable Long memberId) {
        return ResponseEntity.ok(userService.getTasksForMember(memberId, getCurrentUserId()));
    }
}
