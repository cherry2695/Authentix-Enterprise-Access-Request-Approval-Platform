package com.accessflow.service;

import com.accessflow.audit.AuditService;
import com.accessflow.dto.*;
import com.accessflow.entity.Application;
import com.accessflow.entity.ApplicationRole;
import com.accessflow.entity.User;
import com.accessflow.entity.enums.UserRole;
import com.accessflow.exception.BadRequestException;
import com.accessflow.exception.ResourceNotFoundException;
import com.accessflow.repository.ApplicationRepository;
import com.accessflow.repository.ApplicationRoleRepository;
import com.accessflow.repository.UserRepository;
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
class ApplicationServiceTest {

    @Mock
    private ApplicationRepository applicationRepository;
    @Mock
    private ApplicationRoleRepository applicationRoleRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private AuditService auditService;

    @InjectMocks
    private ApplicationService service;

    private User admin;
    private Application application;

    @BeforeEach
    void setUp() {
        admin = User.builder().id(1L).fullName("Ava Administrator").role(UserRole.ADMIN).active(true).build();
        application = Application.builder().id(1L).name("CRM").active(true).build();
    }

    @Test
    void createApplication_withUnknownOwnerId_throwsBadRequest() {
        CreateApplicationRequest request = new CreateApplicationRequest("Finance Portal", "desc", "Finance", 999L);
        when(userRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(BadRequestException.class, () -> service.createApplication(request, admin));
        verify(applicationRepository, never()).save(any());
    }

    @Test
    void createApplication_valid_savesAndReturnsResponse() {
        CreateApplicationRequest request = new CreateApplicationRequest("Finance Portal", "desc", "Finance", null);
        when(applicationRepository.save(any(Application.class))).thenAnswer(inv -> {
            Application saved = inv.getArgument(0);
            saved.setId(42L);
            return saved;
        });

        ApplicationResponse response = service.createApplication(request, admin);

        assertEquals("Finance Portal", response.name());
        assertTrue(response.active());
        verify(auditService).record(eq(admin), anyString(), eq("Application"), eq(42L));
    }

    @Test
    void getApplicationById_inactiveAsNonAdmin_throwsNotFound() {
        application.setActive(false);
        when(applicationRepository.findById(1L)).thenReturn(Optional.of(application));

        assertThrows(ResourceNotFoundException.class, () -> service.getApplicationById(1L, false));
    }

    @Test
    void getApplicationById_inactiveAsAdmin_returnsResponse() {
        application.setActive(false);
        when(applicationRepository.findById(1L)).thenReturn(Optional.of(application));

        ApplicationResponse response = service.getApplicationById(1L, true);
        assertFalse(response.active());
    }

    @Test
    void createRole_duplicateNameCaseInsensitive_throwsBadRequest() {
        ApplicationRole existing = ApplicationRole.builder().id(1L).application(application).roleName("VIEWER").active(true).build();
        when(applicationRepository.findById(1L)).thenReturn(Optional.of(application));
        when(applicationRoleRepository.findByApplicationId(1L)).thenReturn(List.of(existing));

        CreateApplicationRoleRequest request = new CreateApplicationRoleRequest("viewer", "desc");

        assertThrows(BadRequestException.class, () -> service.createRole(1L, request, admin));
        verify(applicationRoleRepository, never()).save(any());
    }

    @Test
    void createRole_unknownApplication_throwsNotFound() {
        when(applicationRepository.findById(1L)).thenReturn(Optional.empty());
        CreateApplicationRoleRequest request = new CreateApplicationRoleRequest("VIEWER", "desc");

        assertThrows(ResourceNotFoundException.class, () -> service.createRole(1L, request, admin));
    }

    @Test
    void createRole_valid_savesSuccessfully() {
        when(applicationRepository.findById(1L)).thenReturn(Optional.of(application));
        when(applicationRoleRepository.findByApplicationId(1L)).thenReturn(List.of());
        when(applicationRoleRepository.save(any(ApplicationRole.class))).thenAnswer(inv -> {
            ApplicationRole saved = inv.getArgument(0);
            saved.setId(5L);
            return saved;
        });

        ApplicationRoleResponse response = service.createRole(1L, new CreateApplicationRoleRequest("EDITOR", "desc"), admin);

        assertEquals("EDITOR", response.roleName());
        assertTrue(response.active());
    }
}
