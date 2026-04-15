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

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private Long ownerId;

    /**
     * FetchType.EAGER ensures the collection is loaded within the JPA transaction
     * and available when Jackson serializes the response (required when
     * spring.jpa.open-in-view=false).
     */
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(
        name = "project_members",
        joinColumns = @JoinColumn(name = "project_id")
    )
    @Column(name = "user_id")
    private List<Long> memberIds = new ArrayList<>();
}