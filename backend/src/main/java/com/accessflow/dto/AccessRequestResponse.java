package com.accessflow.dto;

import java.time.LocalDateTime;

public record AccessRequestResponse(
        Long id,
        Long requesterId,
        String requesterName,
        Long applicationId,
        String applicationName,
        Long applicationRoleId,
        String roleName,
        String justification,
        String status,
        Long assignedManagerId,
        String assignedManagerName,
        LocalDateTime submittedAt,
        LocalDateTime updatedAt,
        LocalDateTime expiresAt
) {
}
