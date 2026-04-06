package com.smartboard.smartboard.entity;
import jakarta.persistence.*;
import lombok.*;
@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Task {
    @Id
    @GeneratedValue(strategy=GenerationType.IDENTITY)
    private Long id;
    private String title;
    private boolean completed=false;
    private Long projectId;
    private Long assignedTo;
}
