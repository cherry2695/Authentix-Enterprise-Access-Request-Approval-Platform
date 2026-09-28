package com.accessflow.controller;

import com.accessflow.dto.RevokePermissionRequest;
import com.accessflow.dto.UserPermissionResponse;
import com.accessflow.entity.enums.PermissionStatus;
import com.accessflow.security.CustomUserDetails;
import com.accessflow.service.PermissionService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/permissions")
public class PermissionController {

    private final PermissionService permissionService;

    public PermissionController(PermissionService permissionService) {
        this.permissionService = permissionService;
    }

    /**
     * Admin endpoint: view all permissions across the enterprise.
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserPermissionResponse>> getAllPermissions(
            @RequestParam(required = false) PermissionStatus status) {
        return ResponseEntity.ok(permissionService.getAllPermissions(status));
    }

    /**
     * Authenticated endpoint: view caller's own permissions.
     */
    @GetMapping("/my")
    public ResponseEntity<List<UserPermissionResponse>> getMyPermissions(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(permissionService.getMyPermissions(userDetails.getUser()));
    }

    /**
     * View permissions for a specific user (admin, manager, or self).
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<UserPermissionResponse>> getUserPermissions(
            @PathVariable Long userId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(permissionService.getUserPermissions(userId, userDetails.getUser()));
    }

    /**
     * Revoke a permission (admin or self).
     */
    @PostMapping("/{id}/revoke")
    public ResponseEntity<UserPermissionResponse> revokePermission(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody(required = false) RevokePermissionRequest request) {
        return ResponseEntity.ok(permissionService.revokePermission(id, userDetails.getUser(), request));
    }
}
