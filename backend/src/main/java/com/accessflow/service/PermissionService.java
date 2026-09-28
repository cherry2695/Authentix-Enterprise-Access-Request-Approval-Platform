package com.accessflow.service;

import com.accessflow.audit.AuditAction;
import com.accessflow.audit.AuditService;
import com.accessflow.dto.RevokePermissionRequest;
import com.accessflow.dto.UserPermissionResponse;
import com.accessflow.entity.User;
import com.accessflow.entity.UserPermission;
import com.accessflow.entity.enums.NotificationType;
import com.accessflow.entity.enums.PermissionStatus;
import com.accessflow.entity.enums.UserRole;
import com.accessflow.exception.BadRequestException;
import com.accessflow.exception.ResourceNotFoundException;
import com.accessflow.exception.UnauthorizedActionException;
import com.accessflow.mapper.UserPermissionMapper;
import com.accessflow.repository.UserPermissionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;

@Service
public class PermissionService {

    private final UserPermissionRepository userPermissionRepository;
    private final AuditService auditService;
    private final NotificationService notificationService;

    public PermissionService(UserPermissionRepository userPermissionRepository,
                             AuditService auditService,
                             NotificationService notificationService) {
        this.userPermissionRepository = userPermissionRepository;
        this.auditService = auditService;
        this.notificationService = notificationService;
    }

    /**
     * Admin view of all permissions, optionally filtered by status.
     */
    public List<UserPermissionResponse> getAllPermissions(PermissionStatus status) {
        List<UserPermission> list = status != null
                ? userPermissionRepository.findByStatus(status)
                : userPermissionRepository.findAll();

        return list.stream()
                .sorted(Comparator.comparing(UserPermission::getGrantedAt).reversed())
                .map(UserPermissionMapper::toResponse)
                .toList();
    }

    /**
     * Return active and historical permissions for the authenticated caller.
     */
    public List<UserPermissionResponse> getMyPermissions(User user) {
        return userPermissionRepository.findByUserId(user.getId()).stream()
                .sorted(Comparator.comparing(UserPermission::getGrantedAt).reversed())
                .map(UserPermissionMapper::toResponse)
                .toList();
    }

    /**
     * Return permissions for a specific user. Permitted to:
     * - The user themselves.
     * - The user's direct manager.
     * - Any admin.
     */
    public List<UserPermissionResponse> getUserPermissions(Long targetUserId, User caller) {
        boolean isSelf = caller.getId().equals(targetUserId);
        boolean isAdmin = caller.getRole() == UserRole.ADMIN;
        boolean isManager = caller.getRole() == UserRole.MANAGER; // We can check if target reports to caller

        if (!isSelf && !isAdmin && !isManager) {
            throw new UnauthorizedActionException("You do not have permission to view this user's permissions.");
        }

        return userPermissionRepository.findByUserId(targetUserId).stream()
                .sorted(Comparator.comparing(UserPermission::getGrantedAt).reversed())
                .map(UserPermissionMapper::toResponse)
                .toList();
    }

    /**
     * Revoke an active permission.
     * Accessible by ADMIN, or by the EMPLOYEE themselves (self-service revocation).
     */
    @Transactional
    public UserPermissionResponse revokePermission(Long permissionId, User caller, RevokePermissionRequest request) {
        UserPermission permission = userPermissionRepository.findById(permissionId)
                .orElseThrow(() -> new ResourceNotFoundException("Permission not found."));

        boolean isSelf = permission.getUser().getId().equals(caller.getId());
        boolean isAdmin = caller.getRole() == UserRole.ADMIN;

        if (!isSelf && !isAdmin) {
            throw new UnauthorizedActionException("You are not authorized to revoke this permission.");
        }

        if (permission.getStatus() != PermissionStatus.ACTIVE) {
            throw new BadRequestException("Permission is already " + permission.getStatus() + " and cannot be revoked.");
        }

        String reason = request != null && request.reason() != null && !request.reason().trim().isEmpty()
                ? request.reason()
                : (isSelf ? "Self-requested revocation by employee" : "Revoked by Administrator");

        permission.setStatus(PermissionStatus.REVOKED);
        permission.setRevokedAt(LocalDateTime.now());
        permission = userPermissionRepository.save(permission);

        // Record Audit event
        auditService.record(caller, AuditAction.PERMISSION_REVOKED, "UserPermission", permission.getId(),
                PermissionStatus.ACTIVE.name(), PermissionStatus.REVOKED.name(), reason, null);

        // Send notification
        String notifMsg = "Access to " + permission.getApplication().getName() + " (" +
                permission.getApplicationRole().getRoleName() + ") has been revoked. Reason: " + reason;
        notificationService.createNotification(permission.getUser(), "Access Revoked", notifMsg,
                NotificationType.ACCESS_REVOKED, permission.getId());

        return UserPermissionMapper.toResponse(permission);
    }

    /**
     * Effective permission checking service.
     */
    public boolean hasActivePermission(Long userId, String applicationName, String roleName) {
        return userPermissionRepository.findByUserIdAndStatus(userId, PermissionStatus.ACTIVE).stream()
                .anyMatch(p -> p.getApplication().getName().equalsIgnoreCase(applicationName)
                        && p.getApplicationRole().getRoleName().equalsIgnoreCase(roleName));
    }
}
