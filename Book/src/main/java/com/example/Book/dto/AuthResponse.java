package com.example.Book.dto;

import com.example.Book.entities.Role;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class AuthResponse {
    private String token;
    private Long id;
    private Long userId;
    private String name;
    private Role role;

    public AuthResponse(String token, Long userId, String name, Role role) {
        this.token = token;
        this.id = userId;
        this.userId = userId;
        this.name = name;
        this.role = role;
    }
}
