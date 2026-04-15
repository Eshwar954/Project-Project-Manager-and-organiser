package com.smartboard.smartboard.dto;

import java.time.LocalDateTime;

import lombok.*;

/** Enriched comment — includes author name so the frontend doesn't need a second lookup. */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CommentResponse {
    private Long id;
    private Long taskId;
    private Long authorId;
    private String authorName;
    private String content;
    private LocalDateTime createdAt;
}
