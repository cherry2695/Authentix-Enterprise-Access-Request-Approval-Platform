package com.accessflow.audit;

import com.accessflow.entity.AuditLog;
import com.accessflow.entity.User;
import com.accessflow.repository.AuditLogRepository;
import org.springframework.stereotype.Service;

/**
 * The only class permitted to write to audit_logs. Entries are append-only:
 * there is intentionally no update/delete method here or in the repository
 * layer that the rest of the application uses.
 *
 * IMPORTANT: never pass a raw password, JWT, or other credential into
 * oldValue/newValue/reason.
 */
@Service
public class AuditService {

    private final AuditLogRepository auditLogRepository;

    public AuditService(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    public void record(User actor, String action, String entityType, Long entityId,
                        String oldValue, String newValue, String reason, String correlationId) {
        AuditLog log = AuditLog.builder()
                .actor(actor)
                .action(action)
                .entityType(entityType)
                .entityId(entityId)
                .oldValue(oldValue)
                .newValue(newValue)
                .reason(reason)
                .correlationId(correlationId)
                .build();
        auditLogRepository.save(log);
    }

    /** Convenience overload for simple events with no before/after state. */
    public void record(User actor, String action, String entityType, Long entityId) {
        record(actor, action, entityType, entityId, null, null, null, null);
    }
}
