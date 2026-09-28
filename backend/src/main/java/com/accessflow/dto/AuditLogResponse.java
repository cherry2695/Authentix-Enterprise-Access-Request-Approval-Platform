package com.accessflow.dto;

import java.time.LocalDateTime;

public record AuditLogResponse(
        Long id,
        Long actorId,
        String actorName,
        String actorEmail,
        String action,
        String entityType,
        Long entityId,
        String oldValue,
        String newValue,
        String reason,
        String correlationId,
        LocalDateTime createdAt
) {
}
