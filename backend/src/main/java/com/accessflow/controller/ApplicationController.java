package com.accessflow.controller;

import com.accessflow.dto.*;
import com.accessflow.entity.enums.UserRole;
import com.accessflow.security.CustomUserDetails;
import com.accessflow.service.ApplicationService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/applications")
public class ApplicationController {

    private final ApplicationService applicationService;

    public ApplicationController(ApplicationService applicationService) {
        this.applicationService = applicationService;
    }

    @GetMapping
    public ResponseEntity<List<ApplicationResponse>> list(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "false") boolean includeInactive,
            @AuthenticationPrincipal CustomUserDetails principal) {

        boolean effectiveIncludeInactive = includeInactive && isAdmin(principal);
        return ResponseEntity.ok(applicationService.listApplications(category, search, effectiveIncludeInactive));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApplicationResponse> getById(@PathVariable Long id,
                                                        @AuthenticationPrincipal CustomUserDetails principal) {
        return ResponseEntity.ok(applicationService.getApplicationById(id, isAdmin(principal)));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApplicationResponse> create(@Valid @RequestBody CreateApplicationRequest request,
                                                       @AuthenticationPrincipal CustomUserDetails principal) {
        ApplicationResponse created = applicationService.createApplication(request, principal.getUser());
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApplicationResponse> update(@PathVariable Long id,
                                                       @Valid @RequestBody UpdateApplicationRequest request,
                                                       @AuthenticationPrincipal CustomUserDetails principal) {
        return ResponseEntity.ok(applicationService.updateApplication(id, request, principal.getUser()));
    }

    @GetMapping("/{id}/roles")
    public ResponseEntity<List<ApplicationRoleResponse>> listRoles(
            @PathVariable Long id,
            @RequestParam(defaultValue = "false") boolean includeInactive,
            @AuthenticationPrincipal CustomUserDetails principal) {

        boolean effectiveIncludeInactive = includeInactive && isAdmin(principal);
        return ResponseEntity.ok(applicationService.listRoles(id, effectiveIncludeInactive));
    }

    @PostMapping("/{id}/roles")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApplicationRoleResponse> createRole(@PathVariable Long id,
                                                               @Valid @RequestBody CreateApplicationRoleRequest request,
                                                               @AuthenticationPrincipal CustomUserDetails principal) {
        ApplicationRoleResponse created = applicationService.createRole(id, request, principal.getUser());
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}/roles/{roleId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApplicationRoleResponse> updateRole(@PathVariable Long id,
                                                               @PathVariable Long roleId,
                                                               @Valid @RequestBody UpdateApplicationRoleRequest request,
                                                               @AuthenticationPrincipal CustomUserDetails principal) {
        return ResponseEntity.ok(applicationService.updateRole(id, roleId, request, principal.getUser()));
    }

    private boolean isAdmin(CustomUserDetails principal) {
        return principal.getUser().getRole() == UserRole.ADMIN;
    }
}
