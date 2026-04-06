package com.smartboard.smartboard.services;

import java.util.List;

import org.springframework.stereotype.Service;

import com.smartboard.smartboard.dto.TaskRequest;
import com.smartboard.smartboard.entity.Project;
import com.smartboard.smartboard.entity.Task;
import com.smartboard.smartboard.repository.ProjectRepository;
import com.smartboard.smartboard.repository.TasksRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TaskService {
    private final TasksRepository taskRepository;
    private final ProjectRepository projectRepository;

    public Task createTask(Long projectId, TaskRequest req, Long requestingUserId) {
        Project project = projectRepository.findById(projectId)
            .orElseThrow(() -> new RuntimeException("Project not found"));

        if (!project.getOwnerId().equals(requestingUserId))
            throw new RuntimeException("Only ADMIN can create tasks");

        Task task = new Task();
        task.setTitle(req.getTitle());
        task.setProjectId(projectId);
        task.setAssignedTo(req.getAssignedTo());
        return taskRepository.save(task);
    }

    public List<Task> getProjectTasks(Long projectId) {
        return taskRepository.findByProjectId(projectId);
    }

    public Task completeTask(Long taskId) {
        Task task = taskRepository.findById(taskId)
            .orElseThrow(() -> new RuntimeException("Task not found"));
        task.setCompleted(true);
        return taskRepository.save(task);
    }

    public Task assignTask(Long taskId, Long assignedTo, Long requestingUserId) {
        Task task = taskRepository.findById(taskId)
            .orElseThrow(() -> new RuntimeException("Task not found"));
        Project project = projectRepository.findById(task.getProjectId())
            .orElseThrow(() -> new RuntimeException("Project not found"));

        if (!project.getOwnerId().equals(requestingUserId))
            throw new RuntimeException("Only ADMIN can assign tasks");

        task.setAssignedTo(assignedTo);
        return taskRepository.save(task);
    }
}