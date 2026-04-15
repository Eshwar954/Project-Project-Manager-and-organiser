package com.smartboard.smartboard.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.smartboard.smartboard.entity.Task;

public interface TasksRepository extends JpaRepository<Task,Long> {
    List<Task>findByProjectId(Long projectId);
    long countByProjectId(Long projectId);
    long countByProjectIdAndCompleted(Long projectId, boolean completed);
    List<Task> findByProjectIdInAndAssignedTo(List<Long> projectIds, Long assignedTo);
}
