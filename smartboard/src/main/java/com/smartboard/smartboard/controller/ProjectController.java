package com.smartboard.smartboard.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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
    private final ProjectRepository projectrepository;

    private Long getCurrentUserId() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found")).getId();
    }

    @PostMapping
    public ResponseEntity<Project> create(@RequestBody Map<String, String> body) {
        return ResponseEntity.ok(projectService.createProject(body.get("name"), getCurrentUserId()));
    }

    @GetMapping
    public ResponseEntity<List<Project>> list() {
        return ResponseEntity.ok(projectService.getUserProjects(getCurrentUserId()));
    }

    @PostMapping("/{id}/members")
    public ResponseEntity<Project> addMember(@PathVariable Long id, @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(projectService.addMember(id, body.get("email"), getCurrentUserId()));
    }

    @GetMapping("/{id}/progress")
    public ResponseEntity<Map<String, Object>> progress(@PathVariable Long id) {
        return ResponseEntity.ok(projectService.getProjectProgress(id));
    }
    @GetMapping("/{id}/members")
    public ResponseEntity<List<User>>getMembers(@PathVariable Long id){
        Project project = projectrepository.findById(id)
        .orElseThrow(() -> new RuntimeException("Project not found"));
        List<User>members=userRepository.findAllById(project.getMemberIds());
        return ResponseEntity.ok(members);
    }
    
}