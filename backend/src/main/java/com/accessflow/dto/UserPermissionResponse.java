package com.accessflow.dto;

import java.time.LocalDateTime;

public record UserPermissionResponse(
        Long id,
        Long userId,
        String userName,
        String userEmail,
        Long applicationId,
        String applicationName,
        String applicationCategory,
        Long applicationRoleId,
        String roleName,
        Long accessRequestId,
        Long grantedById,
        String grantedByName,
        LocalDateTime grantedAt,
        LocalDateTime expiresAt,
        LocalDateTime revokedAt,
        String status
) {
}
