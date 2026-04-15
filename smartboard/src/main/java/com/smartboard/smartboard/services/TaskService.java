package com.smartboard.smartboard.services;

import java.util.List;

import org.springframework.stereotype.Service;

import com.smartboard.smartboard.dto.CommentRequest;
import com.smartboard.smartboard.dto.CommentResponse;
import com.smartboard.smartboard.dto.TaskRequest;
import com.smartboard.smartboard.entity.Comment;
import com.smartboard.smartboard.entity.Project;
import com.smartboard.smartboard.entity.Task;
import com.smartboard.smartboard.entity.User;
import com.smartboard.smartboard.repository.CommentRepository;
import com.smartboard.smartboard.repository.ProjectRepository;
import com.smartboard.smartboard.repository.TasksRepository;
import com.smartboard.smartboard.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final TasksRepository    taskRepository;
    private final ProjectRepository  projectRepository;
    private final CommentRepository  commentRepository;
    private final UserRepository     userRepository;

    // ── Task CRUD ──────────────────────────────────────────────────────────────

    public Task createTask(Long projectId, TaskRequest req, Long requestingUserId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        if (!project.getOwnerId().equals(requestingUserId))
            throw new RuntimeException("Only admin can create tasks");

        String priority = (req.getPriority() != null && !req.getPriority().isBlank())
                ? req.getPriority().toUpperCase()
                : "MEDIUM";

        if (req.getAssignedTo() != null && !project.getMemberIds().contains(req.getAssignedTo()))
            throw new RuntimeException("Assigned user is not a member of this project");

        Task task = new Task();
        task.setTitle(req.getTitle().trim());
        task.setDescription(req.getDescription());
        task.setPriority(priority);
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
            throw new RuntimeException("Only admin can assign tasks");

        task.setAssignedTo(assignedTo);
        return taskRepository.save(task);
    }

    // ── Comments ───────────────────────────────────────────────────────────────

    public CommentResponse addComment(Long taskId, CommentRequest req, Long authorId) {
        taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        Comment comment = new Comment();
        comment.setTaskId(taskId);
        comment.setAuthorId(authorId);
        comment.setContent(req.getContent().trim());
        Comment saved = commentRepository.save(comment);

        String authorName = userRepository.findById(authorId)
                .map(User::getName)
                .orElse("Unknown");

        return toResponse(saved, authorName);
    }

    public List<CommentResponse> getComments(Long taskId) {
        taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        return commentRepository.findByTaskIdOrderByCreatedAtAsc(taskId)
                .stream()
                .map(c -> {
                    String name = userRepository.findById(c.getAuthorId())
                            .map(User::getName).orElse("Unknown");
                    return toResponse(c, name);
                })
                .toList();
    }

    private CommentResponse toResponse(Comment c, String authorName) {
        return new CommentResponse(
                c.getId(), c.getTaskId(), c.getAuthorId(),
                authorName, c.getContent(), c.getCreatedAt()
        );
    }
}