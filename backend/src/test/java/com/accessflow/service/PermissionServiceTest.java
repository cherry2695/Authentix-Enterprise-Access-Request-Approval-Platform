package com.accessflow.service;

import com.accessflow.audit.AuditService;
import com.accessflow.dto.RevokePermissionRequest;
import com.accessflow.dto.UserPermissionResponse;
import com.accessflow.entity.Application;
import com.accessflow.entity.ApplicationRole;
import com.accessflow.entity.User;
import com.accessflow.entity.UserPermission;
import com.accessflow.entity.enums.PermissionStatus;
import com.accessflow.entity.enums.UserRole;
import com.accessflow.exception.BadRequestException;
import com.accessflow.exception.UnauthorizedActionException;
import com.accessflow.repository.UserPermissionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PermissionServiceTest {

    @Mock
    private UserPermissionRepository userPermissionRepository;
    @Mock
    private AuditService auditService;
    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private PermissionService permissionService;

    private User admin;
    private User employee;
    private User otherEmployee;
    private Application application;
    private ApplicationRole role;
    private UserPermission activePermission;

    @BeforeEach
    void setUp() {
        admin = User.builder().id(1L).fullName("Ava Admin").role(UserRole.ADMIN).build();
        employee = User.builder().id(2L).fullName("Ethan Employee").role(UserRole.EMPLOYEE).build();
        otherEmployee = User.builder().id(3L).fullName("Other Employee").role(UserRole.EMPLOYEE).build();

        application = Application.builder().id(10L).name("CRM").category("Sales").build();
        role = ApplicationRole.builder().id(20L).roleName("VIEWER").build();

        activePermission = UserPermission.builder()
                .id(100L)
                .user(employee)
                .application(application)
                .applicationRole(role)
                .grantedBy(admin)
                .grantedAt(LocalDateTime.now().minusDays(5))
                .status(PermissionStatus.ACTIVE)
                .build();
    }

    @Test
    void revokePermission_adminCaller_revokesSuccessfully() {
        when(userPermissionRepository.findById(100L)).thenReturn(Optional.of(activePermission));
        when(userPermissionRepository.save(any(UserPermission.class))).thenAnswer(invocation -> invocation.getArgument(0));

        UserPermissionResponse resp = permissionService.revokePermission(100L, admin, new RevokePermissionRequest("Role no longer required"));

        assertNotNull(resp);
        assertEquals(PermissionStatus.REVOKED.name(), resp.status());
        verify(auditService, times(1)).record(eq(admin), anyString(), eq("UserPermission"), eq(100L), any(), any(), any(), any());
        verify(notificationService, times(1)).createNotification(eq(employee), anyString(), anyString(), any(), eq(100L));
    }

    @Test
    void revokePermission_unauthorizedCaller_throwsUnauthorized() {
        when(userPermissionRepository.findById(100L)).thenReturn(Optional.of(activePermission));

        assertThrows(UnauthorizedActionException.class, () ->
                permissionService.revokePermission(100L, otherEmployee, new RevokePermissionRequest("Illegal revoke")));
    }

    @Test
    void revokePermission_alreadyRevoked_throwsBadRequest() {
        activePermission.setStatus(PermissionStatus.REVOKED);
        when(userPermissionRepository.findById(100L)).thenReturn(Optional.of(activePermission));

        assertThrows(BadRequestException.class, () ->
                permissionService.revokePermission(100L, admin, new RevokePermissionRequest("Revoking again")));
    }
}
