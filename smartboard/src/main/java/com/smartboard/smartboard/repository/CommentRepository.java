package com.smartboard.smartboard.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.smartboard.smartboard.entity.Comment;

public interface CommentRepository extends JpaRepository<Comment, Long> {
    List<Comment> findByTaskIdOrderByCreatedAtAsc(Long taskId);
}
