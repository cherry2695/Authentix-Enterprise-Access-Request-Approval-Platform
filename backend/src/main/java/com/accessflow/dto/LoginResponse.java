package com.accessflow.dto;

public record LoginResponse(
        String token,
        UserResponse user
) {
}
