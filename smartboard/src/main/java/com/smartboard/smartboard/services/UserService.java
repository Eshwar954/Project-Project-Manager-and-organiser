package com.smartboard.smartboard.services;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.smartboard.smartboard.entity.Project;
import com.smartboard.smartboard.entity.Task;
import com.smartboard.smartboard.entity.User;
import com.smartboard.smartboard.repository.ProjectRepository;
import com.smartboard.smartboard.repository.TasksRepository;
import com.smartboard.smartboard.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository    userRepository;
    private final ProjectRepository projectRepository;
    private final TasksRepository   taskRepository;

    /** Get the current user's profile */
    public User getProfile(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    /**
     * Get all unique team members across all projects the user belongs to.
     * (Union of all member lists from all user's projects — minus duplicates.)
     */
    public List<User> getTeamMembers(Long userId) {
        List<Project> userProjects = projectRepository.findByOwnerIdOrMemberIdsContaining(userId, userId);

        List<Long> allMemberIds = userProjects.stream()
                .flatMap(p -> p.getMemberIds().stream())
                .distinct()
                .collect(Collectors.toList());

        return userRepository.findAllById(allMemberIds);
    }

    /**
     * Get all tasks assigned to a specific user across all projects.
     * Used by admin to see workload per member.
     */
    public List<Task> getTasksForMember(Long memberId, Long requestingUserId) {
        // Ensure the requesting user shares at least one project with the member
        List<Project> sharedProjects = projectRepository
                .findByOwnerIdOrMemberIdsContaining(requestingUserId, requestingUserId)
                .stream()
                .filter(p -> p.getMemberIds().contains(memberId))
                .toList();

        if (sharedProjects.isEmpty())
            throw new RuntimeException("Member not found in your projects");

        List<Long> projectIds = sharedProjects.stream().map(Project::getId).toList();

        return taskRepository.findAll().stream()
                .filter(t -> projectIds.contains(t.getProjectId())
                          && memberId.equals(t.getAssignedTo()))
                .toList();
    }
}
