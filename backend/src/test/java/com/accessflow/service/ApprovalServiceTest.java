package com.accessflow.service;

import com.accessflow.audit.AuditService;
import com.accessflow.dto.AccessRequestResponse;
import com.accessflow.dto.ApprovalDecisionRequest;
import com.accessflow.entity.AccessRequest;
import com.accessflow.entity.Application;
import com.accessflow.entity.ApplicationRole;
import com.accessflow.entity.User;
import com.accessflow.entity.UserPermission;
import com.accessflow.entity.enums.ApprovalDecision;
import com.accessflow.entity.enums.RequestStatus;
import com.accessflow.entity.enums.UserRole;
import com.accessflow.exception.BadRequestException;
import com.accessflow.exception.UnauthorizedActionException;
import com.accessflow.repository.AccessRequestRepository;
import com.accessflow.repository.ApprovalHistoryRepository;
import com.accessflow.repository.UserPermissionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ApprovalServiceTest {

    @Mock
    private AccessRequestRepository accessRequestRepository;
    @Mock
    private ApprovalHistoryRepository approvalHistoryRepository;
    @Mock
    private UserPermissionRepository userPermissionRepository;
    @Mock
    private AuditService auditService;
    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private ApprovalService approvalService;

    private User admin;
    private User manager;
    private User employee;
    private Application application;
    private ApplicationRole role;
    private AccessRequest requestPendingManager;
    private AccessRequest requestPendingAdmin;

    @BeforeEach
    void setUp() {
        admin = User.builder().id(1L).fullName("Ava Admin").role(UserRole.ADMIN).active(true).build();
        manager = User.builder().id(2L).fullName("Mia Manager").role(UserRole.MANAGER).active(true).build();
        employee = User.builder().id(3L).fullName("Ethan Employee").role(UserRole.EMPLOYEE).manager(manager).active(true).build();

        application = Application.builder().id(1L).name("CRM").active(true).build();
        role = ApplicationRole.builder().id(10L).application(application).roleName("EDITOR").active(true).build();

        requestPendingManager = AccessRequest.builder()
                .id(100L)
                .requester(employee)
                .application(application)
                .applicationRole(role)
                .justification("Need editor access for sales campaign")
                .status(RequestStatus.PENDING_MANAGER_APPROVAL)
                .assignedManager(manager)
                .build();

        requestPendingAdmin = AccessRequest.builder()
                .id(101L)
                .requester(employee)
                .application(application)
                .applicationRole(role)
                .justification("Need editor access for sales campaign")
                .status(RequestStatus.PENDING_ADMIN_APPROVAL)
                .assignedManager(manager)
                .build();
    }

    @Test
    void processManagerDecision_approve_transitionsToPendingAdmin() {
        when(accessRequestRepository.findById(100L)).thenReturn(Optional.of(requestPendingManager));
        when(accessRequestRepository.save(any(AccessRequest.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ApprovalDecisionRequest req = new ApprovalDecisionRequest(ApprovalDecision.APPROVED, "Looks good to me");
        AccessRequestResponse resp = approvalService.processManagerDecision(100L, manager, req);

        assertNotNull(resp);
        assertEquals(RequestStatus.PENDING_ADMIN_APPROVAL.name(), resp.status());
        verify(approvalHistoryRepository, times(1)).save(any());
        verify(notificationService, times(1)).createNotification(eq(employee), anyString(), anyString(), any(), eq(100L));
    }

    @Test
    void processManagerDecision_reject_withoutComment_throwsBadRequest() {
        when(accessRequestRepository.findById(100L)).thenReturn(Optional.of(requestPendingManager));

        ApprovalDecisionRequest req = new ApprovalDecisionRequest(ApprovalDecision.REJECTED, "  ");
        assertThrows(BadRequestException.class, () ->
                approvalService.processManagerDecision(100L, manager, req));
    }

    @Test
    void processManagerDecision_unauthorizedManager_throwsUnauthorized() {
        User otherManager = User.builder().id(99L).fullName("Other Manager").role(UserRole.MANAGER).build();
        when(accessRequestRepository.findById(100L)).thenReturn(Optional.of(requestPendingManager));

        ApprovalDecisionRequest req = new ApprovalDecisionRequest(ApprovalDecision.APPROVED, "Approved");
        assertThrows(UnauthorizedActionException.class, () ->
                approvalService.processManagerDecision(100L, otherManager, req));
    }

    @Test
    void processAdminDecision_approve_grantsPermissionAndTransitionsToAccessGranted() {
        when(accessRequestRepository.findById(101L)).thenReturn(Optional.of(requestPendingAdmin));
        when(accessRequestRepository.save(any(AccessRequest.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ApprovalDecisionRequest req = new ApprovalDecisionRequest(ApprovalDecision.APPROVED, "Final approval granted");
        AccessRequestResponse resp = approvalService.processAdminDecision(101L, admin, req);

        assertNotNull(resp);
        assertEquals(RequestStatus.ACCESS_GRANTED.name(), resp.status());
        verify(userPermissionRepository, times(1)).save(any(UserPermission.class));
        verify(approvalHistoryRepository, times(1)).save(any());
        verify(notificationService, times(1)).createNotification(eq(employee), anyString(), anyString(), any(), eq(101L));
    }

    @Test
    void processAdminDecision_nonAdminCaller_throwsUnauthorized() {
        ApprovalDecisionRequest req = new ApprovalDecisionRequest(ApprovalDecision.APPROVED, "Approved");
        assertThrows(UnauthorizedActionException.class, () ->
                approvalService.processAdminDecision(101L, employee, req));
    }
}
