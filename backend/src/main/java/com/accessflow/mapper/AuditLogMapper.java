package com.accessflow.mapper;

import com.accessflow.dto.AuditLogResponse;
import com.accessflow.entity.AuditLog;
import com.accessflow.entity.User;

public final class AuditLogMapper {

    private AuditLogMapper() {
    }

    public static AuditLogResponse toResponse(AuditLog log) {
        if (log == null) return null;
        User actor = log.getActor();
        return new AuditLogResponse(
                log.getId(),
                actor != null ? actor.getId() : null,
                actor != null ? actor.getFullName() : "System",
                actor != null ? actor.getEmail() : "system@accessflow.io",
                log.getAction(),
                log.getEntityType(),
                log.getEntityId(),
                log.getOldValue(),
                log.getNewValue(),
                log.getReason(),
                log.getCorrelationId(),
                log.getCreatedAt()
        );
    }
}
