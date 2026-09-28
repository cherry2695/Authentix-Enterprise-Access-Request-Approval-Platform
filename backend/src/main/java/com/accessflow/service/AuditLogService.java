package com.accessflow.service;

import com.accessflow.dto.AuditLogResponse;
import com.accessflow.dto.PageResponse;
import com.accessflow.entity.AuditLog;
import com.accessflow.exception.ResourceNotFoundException;
import com.accessflow.mapper.AuditLogMapper;
import com.accessflow.repository.AuditLogRepository;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;

    public AuditLogService(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    public PageResponse<AuditLogResponse> searchAuditLogs(
            String action,
            Long actorId,
            String entityType,
            LocalDateTime startDate,
            LocalDateTime endDate,
            Pageable pageable) {

        Specification<AuditLog> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (action != null && !action.trim().isEmpty()) {
                predicates.add(cb.equal(cb.upper(root.get("action")), action.trim().toUpperCase()));
            }

            if (actorId != null) {
                predicates.add(cb.equal(root.get("actor").get("id"), actorId));
            }

            if (entityType != null && !entityType.trim().isEmpty()) {
                predicates.add(cb.equal(cb.upper(root.get("entityType")), entityType.trim().toUpperCase()));
            }

            if (startDate != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("createdAt"), startDate));
            }

            if (endDate != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("createdAt"), endDate));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<AuditLog> page = auditLogRepository.findAll(spec, pageable);
        return PageResponse.from(page, AuditLogMapper::toResponse);
    }

    public AuditLogResponse getById(Long id) {
        AuditLog log = auditLogRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Audit log entry not found."));
        return AuditLogMapper.toResponse(log);
    }

    public List<AuditLogResponse> getRecentLogs(int limit) {
        Pageable pageable = org.springframework.data.domain.PageRequest.of(0, limit,
                org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "createdAt"));
        return auditLogRepository.findAll(pageable).getContent().stream()
                .map(AuditLogMapper::toResponse)
                .toList();
    }
}
