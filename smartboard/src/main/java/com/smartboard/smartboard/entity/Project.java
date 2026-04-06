package com.smartboard.smartboard.entity;
import jakarta.persistence.*;
import lombok.*;
import java.util.*;
@Entity
@Table(name = "projects")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Project {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    private Long ownerId;
    @ElementCollection
    @CollectionTable(
        name = "project_members",
        joinColumns = @JoinColumn(name = "project_id")
    )
    @Column(name = "user_id")
    private List<Long> memberIds = new ArrayList<>();
}