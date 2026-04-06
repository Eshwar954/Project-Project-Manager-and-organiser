package com.smartboard.smartboard.entity;
import jakarta.persistence.*;
import lombok.*;
@Entity
@Table(name="users")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class User{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    @Column(unique = true,nullable = false)
    private String email;
    @Column(nullable=false)
    private String password;
}