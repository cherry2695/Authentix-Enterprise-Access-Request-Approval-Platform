package com.accessflow.dto;

public record ApplicationRoleResponse(
        Long id,
        Long applicationId,
        String roleName,
        String description,
        boolean active
) {
}
