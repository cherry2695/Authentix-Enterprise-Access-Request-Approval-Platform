package com.accessflow.service;

import com.accessflow.dto.*;
import com.accessflow.entity.AccessRequest;
import com.accessflow.entity.User;
import com.accessflow.entity.enums.PermissionStatus;
import com.accessflow.entity.enums.RequestStatus;
import com.accessflow.entity.enums.ReviewStatus;
import com.accessflow.entity.enums.UserRole;
import com.accessflow.mapper.AccessRequestMapper;
import com.accessflow.mapper.UserPermissionMapper;
import com.accessflow.repository.*;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;

@Service
public class DashboardService {

    private final AccessRequestRepository accessRequestRepository;
    private final UserPermissionRepository userPermissionRepository;
    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final ApplicationRepository applicationRepository;
    private final AccessReviewRepository accessReviewRepository;
    private final AuditLogService auditLogService;

    public DashboardService(AccessRequestRepository accessRequestRepository,
                            UserPermissionRepository userPermissionRepository,
                            NotificationRepository notificationRepository,
                            UserRepository userRepository,
                            ApplicationRepository applicationRepository,
                            AccessReviewRepository accessReviewRepository,
                            AuditLogService auditLogService) {
        this.accessRequestRepository = accessRequestRepository;
        this.userPermissionRepository = userPermissionRepository;
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
        this.applicationRepository = applicationRepository;
        this.accessReviewRepository = accessReviewRepository;
        this.auditLogService = auditLogService;
    }

    public EmployeeDashboardStats getEmployeeDashboard(User user) {
        long total = accessRequestRepository.countByRequesterId(user.getId());
        long pendingManager = accessRequestRepository.countByRequesterIdAndStatus(user.getId(), RequestStatus.PENDING_MANAGER_APPROVAL);
        long pendingAdmin = accessRequestRepository.countByRequesterIdAndStatus(user.getId(), RequestStatus.PENDING_ADMIN_APPROVAL);
        long approved = accessRequestRepository.countByRequesterIdAndStatus(user.getId(), RequestStatus.ACCESS_GRANTED);
        long rejected = accessRequestRepository.countByRequesterIdAndStatus(user.getId(), RequestStatus.REJECTED);
        long activePerms = userPermissionRepository.countByUserIdAndStatus(user.getId(), PermissionStatus.ACTIVE);
        long unread = notificationRepository.countByUserIdAndReadStatusFalse(user.getId());

        List<AccessRequestResponse> recentRequests = accessRequestRepository.findByRequesterId(user.getId()).stream()
                .sorted(Comparator.comparing(AccessRequest::getSubmittedAt).reversed())
                .limit(5)
                .map(AccessRequestMapper::toResponse)
                .toList();

        List<UserPermissionResponse> activePermsList = userPermissionRepository.findByUserIdAndStatus(user.getId(), PermissionStatus.ACTIVE).stream()
                .sorted(Comparator.comparing(com.accessflow.entity.UserPermission::getGrantedAt).reversed())
                .map(UserPermissionMapper::toResponse)
                .toList();

        return new EmployeeDashboardStats(
                total,
                pendingManager + pendingAdmin,
                approved,
                rejected,
                activePerms,
                unread,
                recentRequests,
                activePermsList
        );
    }

    public ManagerDashboardStats getManagerDashboard(User manager) {
        List<AccessRequest> teamRequests = accessRequestRepository.findByAssignedManagerId(manager.getId());

        long pendingApprovals = teamRequests.stream()
                .filter(r -> r.getStatus() == RequestStatus.PENDING_MANAGER_APPROVAL)
                .count();

        long approved = teamRequests.stream()
                .filter(r -> r.getStatus() == RequestStatus.ACCESS_GRANTED || r.getStatus() == RequestStatus.PENDING_ADMIN_APPROVAL)
                .count();

        long rejected = teamRequests.stream()
                .filter(r -> r.getStatus() == RequestStatus.REJECTED)
                .count();

        List<User> teamMembers = userRepository.findByManagerId(manager.getId());

        List<AccessRequestResponse> pendingQueue = teamRequests.stream()
                .filter(r -> r.getStatus() == RequestStatus.PENDING_MANAGER_APPROVAL)
                .sorted(Comparator.comparing(AccessRequest::getSubmittedAt).reversed())
                .map(AccessRequestMapper::toResponse)
                .toList();

        List<AccessRequestResponse> recentTeamRequests = teamRequests.stream()
                .sorted(Comparator.comparing(AccessRequest::getSubmittedAt).reversed())
                .limit(10)
                .map(AccessRequestMapper::toResponse)
                .toList();

        return new ManagerDashboardStats(
                pendingApprovals,
                teamMembers.size(),
                teamRequests.size(),
                approved,
                rejected,
                pendingQueue,
                recentTeamRequests
        );
    }

    public AdminDashboardStats getAdminDashboard() {
        long totalUsers = userRepository.count();
        long activeApps = applicationRepository.findAll().stream().filter(com.accessflow.entity.Application::isActive).count();
        long pendingManager = accessRequestRepository.countByStatus(RequestStatus.PENDING_MANAGER_APPROVAL);
        long pendingAdmin = accessRequestRepository.countByStatus(RequestStatus.PENDING_ADMIN_APPROVAL);
        long approved = accessRequestRepository.countByStatus(RequestStatus.ACCESS_GRANTED);
        long rejected = accessRequestRepository.countByStatus(RequestStatus.REJECTED);
        long activePerms = userPermissionRepository.countByStatus(PermissionStatus.ACTIVE);
        long revokedPerms = userPermissionRepository.countByStatus(PermissionStatus.REVOKED);
        long activeReviews = accessReviewRepository.findAll().stream().filter(r -> r.getStatus() == ReviewStatus.IN_PROGRESS).count();

        List<AccessRequestResponse> pendingAdminQueue = accessRequestRepository.findByStatus(RequestStatus.PENDING_ADMIN_APPROVAL).stream()
                .sorted(Comparator.comparing(AccessRequest::getSubmittedAt).reversed())
                .limit(10)
                .map(AccessRequestMapper::toResponse)
                .toList();

        List<AuditLogResponse> recentAudits = auditLogService.getRecentLogs(8);

        return new AdminDashboardStats(
                totalUsers,
                activeApps,
                pendingManager,
                pendingAdmin,
                approved,
                rejected,
                activePerms,
                revokedPerms,
                activeReviews,
                pendingAdminQueue,
                recentAudits
        );
    }
}
