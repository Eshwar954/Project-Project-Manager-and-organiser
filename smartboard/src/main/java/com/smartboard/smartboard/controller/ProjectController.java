package com.smartboard.smartboard.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import com.smartboard.smartboard.entity.Project;
import com.smartboard.smartboard.entity.User;
import com.smartboard.smartboard.repository.ProjectRepository;
import com.smartboard.smartboard.repository.UserRepository;
import com.smartboard.smartboard.services.ProjectService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectService projectService;
    private final UserRepository userRepository;
    private final ProjectRepository projectRepository;

    // ── Helper ────────────────────────────────────────────────────────────────
    private Long getCurrentUserId() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"))
                .getId();
    }

    // ── Endpoints ─────────────────────────────────────────────────────────────

    /** POST /api/projects — create a new project */
    @PostMapping
    public ResponseEntity<Project> create(@RequestBody Map<String, String> body) {
        String name = body.get("name");
        if (name == null || name.isBlank())
            throw new RuntimeException("Project name is required");
        return ResponseEntity.ok(projectService.createProject(name.trim(), getCurrentUserId()));
    }

    /** GET /api/projects — list projects the current user owns or is a member of */
    @GetMapping
    public ResponseEntity<List<Project>> list() {
        return ResponseEntity.ok(projectService.getUserProjects(getCurrentUserId()));
    }

    /** POST /api/projects/{id}/members — add a member by email (admin only) */
    @PostMapping("/{id}/members")
    public ResponseEntity<Project> addMember(
            @PathVariable Long id,
            @RequestBody Map<String, String> body
    ) {
        String email = body.get("email");
        if (email == null || email.isBlank())
            throw new RuntimeException("Member email is required");
        return ResponseEntity.ok(projectService.addMember(id, email.trim(), getCurrentUserId()));
    }

    /** GET /api/projects/{id}/progress — task completion stats */
    @GetMapping("/{id}/progress")
    public ResponseEntity<Map<String, Object>> progress(@PathVariable Long id) {
        return ResponseEntity.ok(projectService.getProjectProgress(id));
    }

    /**
     * GET /api/projects/{id}/members — list members of a project.
     * User.password is @JsonIgnore so only id/name/email are returned.
     */
    @GetMapping("/{id}/members")
    public ResponseEntity<List<User>> getMembers(@PathVariable Long id) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Project not found"));
        List<User> members = userRepository.findAllById(project.getMemberIds());
        return ResponseEntity.ok(members);
    }
}