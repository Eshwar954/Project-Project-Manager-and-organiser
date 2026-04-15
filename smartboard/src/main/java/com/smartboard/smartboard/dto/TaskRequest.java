package com.smartboard.smartboard.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TaskRequest {

    @NotBlank(message = "Task title is required")
    private String title;

    private String description;

    /** LOW | MEDIUM | HIGH | CRITICAL — defaults to MEDIUM if omitted */
    private String priority = "MEDIUM";

    private Long assignedTo;
}
