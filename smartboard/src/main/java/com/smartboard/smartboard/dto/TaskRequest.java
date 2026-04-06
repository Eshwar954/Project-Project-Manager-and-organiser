package com.smartboard.smartboard.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TaskRequest {
    private String title;
    private Long assignedTo;
}
