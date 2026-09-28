package com.accessflow.dto;

/** Safe, outward-facing view of a User. Never includes passwordHash. */
public record UserResponse(
        Long id,
        String fullName,
        String email,
        String role,
        Long managerId,
        String managerName,
        boolean active
) {
}
