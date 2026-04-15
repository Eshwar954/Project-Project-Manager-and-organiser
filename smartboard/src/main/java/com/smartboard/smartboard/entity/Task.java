package com.smartboard.smartboard.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "tasks")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Task {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(length = 2000)
    private String description;

    /** LOW | MEDIUM | HIGH | CRITICAL */
    @Column(nullable = false)
    private String priority = "MEDIUM";

    private boolean completed = false;
    private Long projectId;
    private Long assignedTo;
}
