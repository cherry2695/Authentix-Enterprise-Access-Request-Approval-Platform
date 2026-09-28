package com.accessflow.service;

import com.accessflow.audit.AuditService;
import com.accessflow.dto.AccessRequestResponse;
import com.accessflow.dto.CreateAccessRequestRequest;
import com.accessflow.entity.*;
import com.accessflow.entity.enums.RequestStatus;
import com.accessflow.entity.enums.UserRole;
import com.accessflow.exception.BadRequestException;
import com.accessflow.exception.ResourceNotFoundException;
import com.accessflow.exception.UnauthorizedActionException;
import com.accessflow.repository.AccessRequestRepository;
import com.accessflow.repository.ApplicationRepository;
import com.accessflow.repository.ApplicationRoleRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AccessRequestServiceTest {

    @Mock
    private AccessRequestRepository accessRequestRepository;
    @Mock
    private ApplicationRepository applicationRepository;
    @Mock
    private ApplicationRoleRepository applicationRoleRepository;
    @Mock
    private AuditService auditService;

    @InjectMocks
    private AccessRequestService service;

    private User manager;
    private User employee;
    private Application application;
    private ApplicationRole role;

    @BeforeEach
    void setUp() {
        manager = User.builder().id(2L).fullName("Mia Manager").role(UserRole.MANAGER).active(true).build();
        employee = User.builder().id(3L).fullName("Ethan Employee").role(UserRole.EMPLOYEE)
                .manager(manager).active(true).build();
        application = Application.builder().id(1L).name("CRM").active(true).build();
        role = ApplicationRole.builder().id(2L).application(application).roleName("EDITOR").active(true).build();
    }

    @Test
    void createRequest_happyPath_savesWithPendingManagerApprovalAndAssignedManager() {
        CreateAccessRequestRequest request = new CreateAccessRequestRequest(1L, 2L, "Need edit access for Q4 renewals.");

        when(applicationRepository.findById(1L)).thenReturn(Optional.of(application));
        when(applicationRoleRepository.findById(2L)).thenReturn(Optional.of(role));
        when(accessRequestRepository.findByRequesterIdAndApplicationIdAndApplicationRoleIdAndStatusIn(
                anyLong(), anyLong(), anyLong(), anyList())).thenReturn(Optional.empty());
        when(accessRequestRepository.save(any(AccessRequest.class))).thenAnswer(inv -> {
            AccessRequest saved = inv.getArgument(0);
            saved.setId(99L);
            return saved;
        });

        AccessRequestResponse response = service.createRequest(employee, request);

        assertEquals(RequestStatus.PENDING_MANAGER_APPROVAL.name(), response.status());
        assertEquals(manager.getId(), response.assignedManagerId());
        verify(auditService).record(eq(employee), anyString(), eq("AccessRequest"), eq(99L), any(), any(), any(), any());
    }

    @Test
    void createRequest_inactiveApplication_throwsBadRequest() {
        application.setActive(false);
        CreateAccessRequestRequest request = new CreateAccessRequestRequest(1L, 2L, "Justification text.");
        when(applicationRepository.findById(1L)).thenReturn(Optional.of(application));

        assertThrows(BadRequestException.class, () -> service.createRequest(employee, request));
        verifyNoInteractions(accessRequestRepository);
    }

    @Test
    void createRequest_roleBelongsToDifferentApplication_throwsBadRequest() {
        Application otherApp = Application.builder().id(5L).name("HRMS").active(true).build();
        ApplicationRole mismatchedRole = ApplicationRole.builder().id(2L).application(otherApp).roleName("VIEWER").active(true).build();

        CreateAccessRequestRequest request = new CreateAccessRequestRequest(1L, 2L, "Justification text.");
        when(applicationRepository.findById(1L)).thenReturn(Optional.of(application));
        when(applicationRoleRepository.findById(2L)).thenReturn(Optional.of(mismatchedRole));

        assertThrows(BadRequestException.class, () -> service.createRequest(employee, request));
    }

    @Test
    void createRequest_duplicatePending_throwsBadRequest() {
        CreateAccessRequestRequest request = new CreateAccessRequestRequest(1L, 2L, "Justification text.");
        when(applicationRepository.findById(1L)).thenReturn(Optional.of(application));
        when(applicationRoleRepository.findById(2L)).thenReturn(Optional.of(role));
        when(accessRequestRepository.findByRequesterIdAndApplicationIdAndApplicationRoleIdAndStatusIn(
                anyLong(), anyLong(), anyLong(), anyList()))
                .thenReturn(Optional.of(new AccessRequest()));

        assertThrows(BadRequestException.class, () -> service.createRequest(employee, request));
        verify(accessRequestRepository, never()).save(any());
    }

    @Test
    void createRequest_noAssignedManager_throwsBadRequest() {
        User orphanEmployee = User.builder().id(4L).fullName("No Manager").role(UserRole.EMPLOYEE).active(true).build();
        CreateAccessRequestRequest request = new CreateAccessRequestRequest(1L, 2L, "Justification text.");

        when(applicationRepository.findById(1L)).thenReturn(Optional.of(application));
        when(applicationRoleRepository.findById(2L)).thenReturn(Optional.of(role));
        when(accessRequestRepository.findByRequesterIdAndApplicationIdAndApplicationRoleIdAndStatusIn(
                anyLong(), anyLong(), anyLong(), anyList())).thenReturn(Optional.empty());

        assertThrows(BadRequestException.class, () -> service.createRequest(orphanEmployee, request));
    }

    @Test
    void cancel_byNonOwner_throwsUnauthorized() {
        AccessRequest existing = AccessRequest.builder().id(10L).requester(employee)
                .status(RequestStatus.PENDING_MANAGER_APPROVAL).build();
        User someoneElse = User.builder().id(999L).role(UserRole.EMPLOYEE).build();

        when(accessRequestRepository.findById(10L)).thenReturn(Optional.of(existing));

        assertThrows(UnauthorizedActionException.class, () -> service.cancel(10L, someoneElse));
    }

    @Test
    void cancel_alreadyGranted_throwsBadRequest() {
        AccessRequest existing = AccessRequest.builder().id(10L).requester(employee)
                .status(RequestStatus.ACCESS_GRANTED).build();

        when(accessRequestRepository.findById(10L)).thenReturn(Optional.of(existing));

        assertThrows(BadRequestException.class, () -> service.cancel(10L, employee));
    }

    @Test
    void cancel_pendingRequestByOwner_succeeds() {
        AccessRequest existing = AccessRequest.builder().id(10L).requester(employee)
                .status(RequestStatus.PENDING_MANAGER_APPROVAL).build();

        when(accessRequestRepository.findById(10L)).thenReturn(Optional.of(existing));
        when(accessRequestRepository.save(any(AccessRequest.class))).thenAnswer(inv -> inv.getArgument(0));

        AccessRequestResponse response = service.cancel(10L, employee);

        assertEquals(RequestStatus.CANCELLED.name(), response.status());
    }

    @Test
    void getById_notOwnerNotManagerNotAdmin_throwsUnauthorized() {
        AccessRequest existing = AccessRequest.builder().id(10L).requester(employee)
                .assignedManager(manager).status(RequestStatus.PENDING_MANAGER_APPROVAL).build();
        User stranger = User.builder().id(777L).role(UserRole.EMPLOYEE).build();

        when(accessRequestRepository.findById(10L)).thenReturn(Optional.of(existing));

        assertThrows(UnauthorizedActionException.class, () -> service.getById(10L, stranger));
    }

    @Test
    void getById_missingRequest_throwsNotFound() {
        when(accessRequestRepository.findById(404L)).thenReturn(Optional.empty());
        assertThrows(ResourceNotFoundException.class, () -> service.getById(404L, employee));
    }

    private static List<RequestStatus> anyList() {
        return any();
    }
}
