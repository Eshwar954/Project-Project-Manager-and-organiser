package com.smartboard.smartboard.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuthRequest {
    private String name;
    private String email;
    private String password;
}
