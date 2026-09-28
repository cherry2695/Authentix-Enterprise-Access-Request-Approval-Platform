package com.accessflow.service;

import com.accessflow.audit.AuditAction;
import com.accessflow.audit.AuditService;
import com.accessflow.dto.*;
import com.accessflow.entity.Application;
import com.accessflow.entity.ApplicationRole;
import com.accessflow.entity.User;
import com.accessflow.exception.BadRequestException;
import com.accessflow.exception.ResourceNotFoundException;
import com.accessflow.mapper.ApplicationMapper;
import com.accessflow.mapper.ApplicationRoleMapper;
import com.accessflow.repository.ApplicationRepository;
import com.accessflow.repository.ApplicationRoleRepository;
import com.accessflow.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final ApplicationRoleRepository applicationRoleRepository;
    private final UserRepository userRepository;
    private final AuditService auditService;

    public ApplicationService(ApplicationRepository applicationRepository,
                               ApplicationRoleRepository applicationRoleRepository,
                               UserRepository userRepository,
                               AuditService auditService) {
        this.applicationRepository = applicationRepository;
        this.applicationRoleRepository = applicationRoleRepository;
        this.userRepository = userRepository;
        this.auditService = auditService;
    }

    /**
     * Catalog listing. Non-admin callers only ever see active applications,
     * regardless of what includeInactive is set to by the controller —
     * the controller decides includeInactive based on the caller's role,
     * but this method double-checks so a future controller bug can't leak
     * inactive applications to non-admins.
     */
    public List<ApplicationResponse> listApplications(String category, String search, boolean includeInactive) {
        List<Application> apps = includeInactive
                ? applicationRepository.findAll()
                : applicationRepository.findByActiveTrue();

        return apps.stream()
                .filter(a -> category == null || category.isBlank()
                        || (a.getCategory() != null && a.getCategory().equalsIgnoreCase(category)))
                .filter(a -> search == null || search.isBlank()
                        || a.getName().toLowerCase().contains(search.toLowerCase())
                        || (a.getDescription() != null && a.getDescription().toLowerCase().contains(search.toLowerCase())))
                .map(ApplicationMapper::toResponse)
                .toList();
    }

    public ApplicationResponse getApplicationById(Long id, boolean isAdmin) {
        Application app = applicationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found."));
        if (!app.isActive() && !isAdmin) {
            // Treat an inactive application as not found for non-admins rather than
            // exposing its existence/details.
            throw new ResourceNotFoundException("Application not found.");
        }
        return ApplicationMapper.toResponse(app);
    }

    @Transactional
    public ApplicationResponse createApplication(CreateApplicationRequest request, User actor) {
        User owner = resolveOwner(request.ownerId());

        Application app = Application.builder()
                .name(request.name())
                .description(request.description())
                .category(request.category())
                .owner(owner)
                .active(true)
                .build();

        app = applicationRepository.save(app);
        auditService.record(actor, AuditAction.APPLICATION_CREATED, "Application", app.getId());
        return ApplicationMapper.toResponse(app);
    }

    @Transactional
    public ApplicationResponse updateApplication(Long id, UpdateApplicationRequest request, User actor) {
        Application app = applicationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found."));

        String oldValue = "active=" + app.isActive();

        app.setName(request.name());
        app.setDescription(request.description());
        app.setCategory(request.category());
        app.setOwner(resolveOwner(request.ownerId()));
        app.setActive(request.active());

        app = applicationRepository.save(app);
        auditService.record(actor, AuditAction.APPLICATION_UPDATED, "Application", app.getId(),
                oldValue, "active=" + app.isActive(), null, null);

        return ApplicationMapper.toResponse(app);
    }

    public List<ApplicationRoleResponse> listRoles(Long applicationId, boolean includeInactive) {
        // Ensure the application itself exists (and is visible) before listing its roles.
        if (!applicationRepository.existsById(applicationId)) {
            throw new ResourceNotFoundException("Application not found.");
        }
        List<ApplicationRole> roles = includeInactive
                ? applicationRoleRepository.findByApplicationId(applicationId)
                : applicationRoleRepository.findByApplicationIdAndActiveTrue(applicationId);

        return roles.stream().map(ApplicationRoleMapper::toResponse).toList();
    }

    @Transactional
    public ApplicationRoleResponse createRole(Long applicationId, CreateApplicationRoleRequest request, User actor) {
        Application app = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found."));

        boolean duplicate = applicationRoleRepository.findByApplicationId(applicationId).stream()
                .anyMatch(r -> r.getRoleName().equalsIgnoreCase(request.roleName()));
        if (duplicate) {
            throw new BadRequestException("A role named '" + request.roleName() + "' already exists for this application.");
        }

        ApplicationRole role = ApplicationRole.builder()
                .application(app)
                .roleName(request.roleName())
                .description(request.description())
                .active(true)
                .build();

        role = applicationRoleRepository.save(role);
        auditService.record(actor, AuditAction.APPLICATION_ROLE_CREATED, "ApplicationRole", role.getId());
        return ApplicationRoleMapper.toResponse(role);
    }

    @Transactional
    public ApplicationRoleResponse updateRole(Long applicationId, Long roleId, UpdateApplicationRoleRequest request, User actor) {
        ApplicationRole role = applicationRoleRepository.findById(roleId)
                .orElseThrow(() -> new ResourceNotFoundException("Access role not found."));

        if (!role.getApplication().getId().equals(applicationId)) {
            throw new BadRequestException("This role does not belong to the specified application.");
        }

        boolean duplicate = applicationRoleRepository.findByApplicationId(applicationId).stream()
                .anyMatch(r -> !r.getId().equals(roleId) && r.getRoleName().equalsIgnoreCase(request.roleName()));
        if (duplicate) {
            throw new BadRequestException("A role named '" + request.roleName() + "' already exists for this application.");
        }

        String oldValue = "active=" + role.isActive();
        role.setRoleName(request.roleName());
        role.setDescription(request.description());
        role.setActive(request.active());

        role = applicationRoleRepository.save(role);
        auditService.record(actor, AuditAction.APPLICATION_ROLE_UPDATED, "ApplicationRole", role.getId(),
                oldValue, "active=" + role.isActive(), null, null);

        return ApplicationRoleMapper.toResponse(role);
    }

    private User resolveOwner(Long ownerId) {
        if (ownerId == null) return null;
        return userRepository.findById(ownerId)
                .orElseThrow(() -> new BadRequestException("Owner user with id " + ownerId + " does not exist."));
    }
}
