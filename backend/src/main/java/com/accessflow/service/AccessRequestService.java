package com.accessflow.service;

import com.accessflow.audit.AuditAction;
import com.accessflow.audit.AuditService;
import com.accessflow.dto.AccessRequestResponse;
import com.accessflow.dto.CreateAccessRequestRequest;
import com.accessflow.dto.PageResponse;
import com.accessflow.entity.AccessRequest;
import com.accessflow.entity.Application;
import com.accessflow.entity.ApplicationRole;
import com.accessflow.entity.User;
import com.accessflow.entity.enums.RequestStatus;
import com.accessflow.entity.enums.UserRole;
import com.accessflow.exception.BadRequestException;
import com.accessflow.exception.ResourceNotFoundException;
import com.accessflow.exception.UnauthorizedActionException;
import com.accessflow.mapper.AccessRequestMapper;
import com.accessflow.repository.AccessRequestRepository;
import com.accessflow.repository.ApplicationRepository;
import com.accessflow.repository.ApplicationRoleRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;

@Service
public class AccessRequestService {

    /** Requests in these states can still be cancelled by the requester. */
    private static final List<RequestStatus> CANCELLABLE_STATUSES =
            List.of(RequestStatus.PENDING_MANAGER_APPROVAL, RequestStatus.PENDING_ADMIN_APPROVAL);

    /** A duplicate pending request is one already in one of these states. */
    private static final List<RequestStatus> IN_FLIGHT_STATUSES =
            List.of(RequestStatus.PENDING_MANAGER_APPROVAL, RequestStatus.PENDING_ADMIN_APPROVAL);

    private final AccessRequestRepository accessRequestRepository;
    private final ApplicationRepository applicationRepository;
    private final ApplicationRoleRepository applicationRoleRepository;
    private final AuditService auditService;

    public AccessRequestService(AccessRequestRepository accessRequestRepository,
                                 ApplicationRepository applicationRepository,
                                 ApplicationRoleRepository applicationRoleRepository,
                                 AuditService auditService) {
        this.accessRequestRepository = accessRequestRepository;
        this.applicationRepository = applicationRepository;
        this.applicationRoleRepository = applicationRoleRepository;
        this.auditService = auditService;
    }

    @Transactional
    public AccessRequestResponse createRequest(User requester, CreateAccessRequestRequest request) {

        Application application = applicationRepository.findById(request.applicationId())
                .orElseThrow(() -> new ResourceNotFoundException("Application not found."));
        if (!application.isActive()) {
            throw new BadRequestException("This application is not currently active and cannot be requested.");
        }

        ApplicationRole role = applicationRoleRepository.findById(request.applicationRoleId())
                .orElseThrow(() -> new ResourceNotFoundException("Access role not found."));
        if (!role.getApplication().getId().equals(application.getId())) {
            throw new BadRequestException("The selected access role does not belong to the selected application.");
        }
        if (!role.isActive()) {
            throw new BadRequestException("This access role is not currently active and cannot be requested.");
        }

        boolean duplicatePending = accessRequestRepository
                .findByRequesterIdAndApplicationIdAndApplicationRoleIdAndStatusIn(
                        requester.getId(), application.getId(), role.getId(), IN_FLIGHT_STATUSES)
                .isPresent();
        if (duplicatePending) {
            throw new BadRequestException(
                    "You already have a pending request for this application and role. " +
                            "Cancel it before submitting a new one.");
        }

        User manager = requester.getManager();
        if (manager == null) {
            throw new BadRequestException(
                    "You do not have an assigned manager. Contact an administrator before submitting a request.");
        }

        AccessRequest entity = AccessRequest.builder()
                .requester(requester)
                .application(application)
                .applicationRole(role)
                .justification(request.justification())
                .status(RequestStatus.PENDING_MANAGER_APPROVAL)
                .assignedManager(manager)
                .build();

        entity = accessRequestRepository.save(entity);
        auditService.record(requester, AuditAction.ACCESS_REQUEST_CREATED, "AccessRequest", entity.getId(),
                null, entity.getStatus().name(), null, null);

        return AccessRequestMapper.toResponse(entity);
    }

    public List<AccessRequestResponse> getMyRequests(User requester) {
        return accessRequestRepository.findByRequesterId(requester.getId()).stream()
                .sorted(Comparator.comparing(AccessRequest::getSubmittedAt).reversed())
                .map(AccessRequestMapper::toResponse)
                .toList();
    }

    /** Visible to the requester themselves, their assigned manager, or any admin. */
    public AccessRequestResponse getById(Long id, User caller) {
        AccessRequest entity = accessRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Access request not found."));

        boolean isOwner = entity.getRequester().getId().equals(caller.getId());
        boolean isAssignedManager = entity.getAssignedManager() != null
                && entity.getAssignedManager().getId().equals(caller.getId());
        boolean isAdmin = caller.getRole() == UserRole.ADMIN;

        if (!isOwner && !isAssignedManager && !isAdmin) {
            throw new UnauthorizedActionException("You do not have permission to view this request.");
        }

        return AccessRequestMapper.toResponse(entity);
    }

    /** Full-catalog listing across all requesters — administrative oversight only. */
    public PageResponse<AccessRequestResponse> listAll(RequestStatus status, Pageable pageable) {
        Page<AccessRequest> page = status != null
                ? accessRequestRepository.findByStatus(status, pageable)
                : accessRequestRepository.findAll(pageable);
        return PageResponse.from(page, AccessRequestMapper::toResponse);
    }

    @Transactional
    public AccessRequestResponse cancel(Long id, User caller) {
        AccessRequest entity = accessRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Access request not found."));

        if (!entity.getRequester().getId().equals(caller.getId())) {
            throw new UnauthorizedActionException("You can only cancel your own requests.");
        }
        if (!CANCELLABLE_STATUSES.contains(entity.getStatus())) {
            throw new BadRequestException("Only requests awaiting approval can be cancelled.");
        }

        RequestStatus oldStatus = entity.getStatus();
        entity.setStatus(RequestStatus.CANCELLED);
        entity = accessRequestRepository.save(entity);

        auditService.record(caller, AuditAction.ACCESS_REQUEST_CANCELLED, "AccessRequest", entity.getId(),
                oldStatus.name(), entity.getStatus().name(), null, null);

        return AccessRequestMapper.toResponse(entity);
    }
}
