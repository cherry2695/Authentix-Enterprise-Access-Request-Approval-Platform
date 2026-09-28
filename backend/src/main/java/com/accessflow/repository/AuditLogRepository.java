package com.accessflow.repository;

import com.accessflow.entity.AuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

/**
 * JpaSpecificationExecutor allows the audit-log explorer to filter by
 * actor, action, date range, application and target user without
 * hand-writing a combinatorial set of finder methods.
 */
public interface AuditLogRepository extends JpaRepository<AuditLog, Long>, JpaSpecificationExecutor<AuditLog> {
    Page<AuditLog> findAll(Pageable pageable);
}
