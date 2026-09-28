package com.accessflow.service;

import com.accessflow.audit.AuditAction;
import com.accessflow.audit.AuditService;
import com.accessflow.dto.AccessRequestResponse;
import com.accessflow.dto.ApprovalDecisionRequest;
import com.accessflow.dto.ApprovalHistoryResponse;
import com.accessflow.entity.AccessRequest;
import com.accessflow.entity.ApprovalHistory;
import com.accessflow.entity.User;
import com.accessflow.entity.UserPermission;
import com.accessflow.entity.enums.ApprovalDecision;
import com.accessflow.entity.enums.ApprovalStage;
import com.accessflow.entity.enums.NotificationType;
import com.accessflow.entity.enums.PermissionStatus;
import com.accessflow.entity.enums.RequestStatus;
import com.accessflow.entity.enums.UserRole;
import com.accessflow.exception.BadRequestException;
import com.accessflow.exception.ResourceNotFoundException;
import com.accessflow.exception.UnauthorizedActionException;
import com.accessflow.mapper.AccessRequestMapper;
import com.accessflow.mapper.ApprovalHistoryMapper;
import com.accessflow.repository.AccessRequestRepository;
import com.accessflow.repository.ApprovalHistoryRepository;
import com.accessflow.repository.UserPermissionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;

@Service
public class ApprovalService {

    private final AccessRequestRepository accessRequestRepository;
    private final ApprovalHistoryRepository approvalHistoryRepository;
    private final UserPermissionRepository userPermissionRepository;
    private final AuditService auditService;
    private final NotificationService notificationService;

    public ApprovalService(AccessRequestRepository accessRequestRepository,
                           ApprovalHistoryRepository approvalHistoryRepository,
                           UserPermissionRepository userPermissionRepository,
                           AuditService auditService,
                           NotificationService notificationService) {
        this.accessRequestRepository = accessRequestRepository;
        this.approvalHistoryRepository = approvalHistoryRepository;
        this.userPermissionRepository = userPermissionRepository;
        this.auditService = auditService;
        this.notificationService = notificationService;
    }

    /**
     * Retrieve all pending requests relevant to the calling user:
     * - Managers see requests assigned to them in PENDING_MANAGER_APPROVAL.
     * - Admins see requests in PENDING_ADMIN_APPROVAL (and PENDING_MANAGER_APPROVAL if desired).
     */
    public List<AccessRequestResponse> getPendingApprovals(User caller) {
        if (caller.getRole() == UserRole.ADMIN) {
            return accessRequestRepository.findByStatus(RequestStatus.PENDING_ADMIN_APPROVAL).stream()
                    .sorted(Comparator.comparing(AccessRequest::getSubmittedAt).reversed())
                    .map(AccessRequestMapper::toResponse)
                    .toList();
        } else if (caller.getRole() == UserRole.MANAGER) {
            return accessRequestRepository.findByAssignedManagerIdAndStatus(caller.getId(), RequestStatus.PENDING_MANAGER_APPROVAL)
                    .stream()
                    .sorted(Comparator.comparing(AccessRequest::getSubmittedAt).reversed())
                    .map(AccessRequestMapper::toResponse)
                    .toList();
        } else {
            throw new UnauthorizedActionException("Employees do not have access to pending approvals.");
        }
    }

    /**
     * Process Manager Stage decision:
     * - Validates caller is the assigned manager.
     * - Validates state is PENDING_MANAGER_APPROVAL.
     * - Disallows self-approval.
     * - Enforces comments on rejection.
     * - Transitions to PENDING_ADMIN_APPROVAL (if approved) or REJECTED.
     */
    @Transactional
    public AccessRequestResponse processManagerDecision(Long requestId, User manager, ApprovalDecisionRequest decisionRequest) {
        AccessRequest request = accessRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Access request not found."));

        if (request.getStatus() != RequestStatus.PENDING_MANAGER_APPROVAL) {
            throw new BadRequestException("Request is not in PENDING_MANAGER_APPROVAL state. Current status: " + request.getStatus());
        }

        // Only assigned manager can act at this stage
        if (request.getAssignedManager() == null || !request.getAssignedManager().getId().equals(manager.getId())) {
            throw new UnauthorizedActionException("Only the assigned manager can review this request at the manager stage.");
        }

        // Cannot approve own request
        if (request.getRequester().getId().equals(manager.getId())) {
            throw new BadRequestException("You cannot approve your own access request.");
        }

        if (decisionRequest.decision() == ApprovalDecision.REJECTED &&
                (decisionRequest.comments() == null || decisionRequest.comments().trim().isEmpty())) {
            throw new BadRequestException("A reason/comment is mandatory when rejecting a request.");
        }

        RequestStatus oldStatus = request.getStatus();
        RequestStatus newStatus;
        String auditAction;
        NotificationType notifType;
        String notifMsg;

        if (decisionRequest.decision() == ApprovalDecision.APPROVED) {
            newStatus = RequestStatus.PENDING_ADMIN_APPROVAL;
            auditAction = AuditAction.MANAGER_APPROVED;
            notifType = NotificationType.REQUEST_APPROVED;
            notifMsg = "Your access request for " + request.getApplication().getName() + " (" +
                    request.getApplicationRole().getRoleName() + ") was approved by your manager and forwarded for Admin review.";
        } else {
            newStatus = RequestStatus.REJECTED;
            auditAction = AuditAction.MANAGER_REJECTED;
            notifType = NotificationType.REQUEST_REJECTED;
            notifMsg = "Your access request for " + request.getApplication().getName() + " was rejected by your manager. Reason: " +
                    decisionRequest.comments();
        }

        request.setStatus(newStatus);
        request = accessRequestRepository.save(request);

        // Record Approval History
        ApprovalHistory history = ApprovalHistory.builder()
                .accessRequest(request)
                .approver(manager)
                .approvalStage(ApprovalStage.MANAGER)
                .decision(decisionRequest.decision())
                .comments(decisionRequest.comments())
                .build();
        approvalHistoryRepository.save(history);

        // Record Audit Log
        auditService.record(manager, auditAction, "AccessRequest", request.getId(),
                oldStatus.name(), newStatus.name(), decisionRequest.comments(), null);

        // Send In-App Notification to requester
        notificationService.createNotification(request.getRequester(), "Access Request Update", notifMsg, notifType, request.getId());

        return AccessRequestMapper.toResponse(request);
    }

    /**
     * Process Admin Stage decision:
     * - Caller must be ADMIN.
     * - Validates state is PENDING_ADMIN_APPROVAL.
     * - Enforces comments on rejection.
     * - If approved: status becomes ACCESS_GRANTED and UserPermission is created within this same transaction!
     */
    @Transactional
    public AccessRequestResponse processAdminDecision(Long requestId, User admin, ApprovalDecisionRequest decisionRequest) {
        if (admin.getRole() != UserRole.ADMIN) {
            throw new UnauthorizedActionException("Only administrators can approve or reject at the admin stage.");
        }

        AccessRequest request = accessRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Access request not found."));

        if (request.getStatus() != RequestStatus.PENDING_ADMIN_APPROVAL) {
            throw new BadRequestException("Request is not in PENDING_ADMIN_APPROVAL state. Current status: " + request.getStatus());
        }

        if (decisionRequest.decision() == ApprovalDecision.REJECTED &&
                (decisionRequest.comments() == null || decisionRequest.comments().trim().isEmpty())) {
            throw new BadRequestException("A reason/comment is mandatory when rejecting a request.");
        }

        RequestStatus oldStatus = request.getStatus();
        RequestStatus newStatus;

        if (decisionRequest.decision() == ApprovalDecision.APPROVED) {
            newStatus = RequestStatus.ACCESS_GRANTED;

            // Atomically create the user permission
            UserPermission permission = UserPermission.builder()
                    .user(request.getRequester())
                    .application(request.getApplication())
                    .applicationRole(request.getApplicationRole())
                    .accessRequest(request)
                    .grantedBy(admin)
                    .grantedAt(LocalDateTime.now())
                    .status(PermissionStatus.ACTIVE)
                    .build();
            userPermissionRepository.save(permission);

            // Audit permission granted
            auditService.record(admin, AuditAction.PERMISSION_GRANTED, "UserPermission", permission.getId(),
                    null, PermissionStatus.ACTIVE.name(), "Granted via access request #" + request.getId(), null);

            // Notify Requester
            String notifMsg = "Access granted! You now have " + request.getApplicationRole().getRoleName() +
                    " access to " + request.getApplication().getName() + ".";
            notificationService.createNotification(request.getRequester(), "Access Granted", notifMsg, NotificationType.ACCESS_GRANTED, request.getId());

            auditService.record(admin, AuditAction.ADMIN_APPROVED, "AccessRequest", request.getId(),
                    oldStatus.name(), newStatus.name(), decisionRequest.comments(), null);
        } else {
            newStatus = RequestStatus.REJECTED;

            String notifMsg = "Your access request for " + request.getApplication().getName() + " was rejected by Admin. Reason: " +
                    decisionRequest.comments();
            notificationService.createNotification(request.getRequester(), "Access Request Rejected", notifMsg, NotificationType.REQUEST_REJECTED, request.getId());

            auditService.record(admin, AuditAction.ADMIN_REJECTED, "AccessRequest", request.getId(),
                    oldStatus.name(), newStatus.name(), decisionRequest.comments(), null);
        }

        request.setStatus(newStatus);
        request = accessRequestRepository.save(request);

        // Record Approval History
        ApprovalHistory history = ApprovalHistory.builder()
                .accessRequest(request)
                .approver(admin)
                .approvalStage(ApprovalStage.ADMIN)
                .decision(decisionRequest.decision())
                .comments(decisionRequest.comments())
                .build();
        approvalHistoryRepository.save(history);

        return AccessRequestMapper.toResponse(request);
    }

    /**
     * Retrieve approval history for a specific request.
     * Authorized for: requester, assigned manager, or admin.
     */
    public List<ApprovalHistoryResponse> getApprovalHistory(Long requestId, User caller) {
        AccessRequest request = accessRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Access request not found."));

        boolean isOwner = request.getRequester().getId().equals(caller.getId());
        boolean isAssignedManager = request.getAssignedManager() != null
                && request.getAssignedManager().getId().equals(caller.getId());
        boolean isAdmin = caller.getRole() == UserRole.ADMIN;

        if (!isOwner && !isAssignedManager && !isAdmin) {
            throw new UnauthorizedActionException("You do not have permission to view the approval history for this request.");
        }

        return approvalHistoryRepository.findByAccessRequestIdOrderByDecidedAtAsc(requestId)
                .stream()
                .map(ApprovalHistoryMapper::toResponse)
                .toList();
    }

    /**
     * Retrieve team requests for a manager (all requests made by direct reports).
     */
    public List<AccessRequestResponse> getTeamRequests(User manager) {
        if (manager.getRole() != UserRole.MANAGER && manager.getRole() != UserRole.ADMIN) {
            throw new UnauthorizedActionException("Only managers or administrators can view team requests.");
        }

        return accessRequestRepository.findByAssignedManagerId(manager.getId())
                .stream()
                .sorted(Comparator.comparing(AccessRequest::getSubmittedAt).reversed())
                .map(AccessRequestMapper::toResponse)
                .toList();
    }
}
