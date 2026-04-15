package com.smartboard.smartboard.services;

import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.smartboard.smartboard.entity.Project;
import com.smartboard.smartboard.entity.User;
import com.smartboard.smartboard.repository.ProjectRepository;
import com.smartboard.smartboard.repository.TasksRepository;
import com.smartboard.smartboard.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ProjectService {
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final TasksRepository taskRepository;

    public Project createProject(String name, Long userId) {
        Project p = new Project();
        p.setName(name);
        p.setOwnerId(userId);
        p.getMemberIds().add(userId); // owner is also a member
        return projectRepository.save(p);
    }

    public List<Project> getUserProjects(Long userId) {
        return projectRepository.findByOwnerIdOrMemberIdsContaining(userId, userId);
    }

    public Project addMember(Long projectId, String memberEmail, Long requestingUserId) {
        Project project = projectRepository.findById(projectId)
            .orElseThrow(() -> new RuntimeException("Project not found"));

        if (!project.getOwnerId().equals(requestingUserId))
            throw new RuntimeException("Only ADMIN can add members");

        User member = userRepository.findByEmail(memberEmail)
            .orElseThrow(() -> new RuntimeException("User not found"));

        if (!project.getMemberIds().contains(member.getId()))
            project.getMemberIds().add(member.getId());

        return projectRepository.save(project);
    }

    public Map<String, Object> getProjectProgress(Long projectId) {
        long total = taskRepository.countByProjectIdAndCompleted(projectId, false)
                   + taskRepository.countByProjectIdAndCompleted(projectId, true);
        long completed = taskRepository.countByProjectIdAndCompleted(projectId, true);
        double progress = total == 0 ? 0 : (completed * 100.0) / total;

        return Map.of("total", total, "completed", completed, "progress", Math.round(progress));
    }
}