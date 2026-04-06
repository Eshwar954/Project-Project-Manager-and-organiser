package com.smartboard.smartboard.dto;
import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AuthResponse {
    private String token;
    private Long userId;
    private String name;
    private String email;

}
