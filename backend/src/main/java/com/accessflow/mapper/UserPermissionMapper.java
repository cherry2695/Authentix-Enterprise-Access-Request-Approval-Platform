package com.accessflow.mapper;

import com.accessflow.dto.UserPermissionResponse;
import com.accessflow.entity.UserPermission;

public final class UserPermissionMapper {

    private UserPermissionMapper() {
    }

    public static UserPermissionResponse toResponse(UserPermission p) {
        if (p == null) return null;
        return new UserPermissionResponse(
                p.getId(),
                p.getUser().getId(),
                p.getUser().getFullName(),
                p.getUser().getEmail(),
                p.getApplication().getId(),
                p.getApplication().getName(),
                p.getApplication().getCategory(),
                p.getApplicationRole().getId(),
                p.getApplicationRole().getRoleName(),
                p.getAccessRequest() != null ? p.getAccessRequest().getId() : null,
                p.getGrantedBy() != null ? p.getGrantedBy().getId() : null,
                p.getGrantedBy() != null ? p.getGrantedBy().getFullName() : null,
                p.getGrantedAt(),
                p.getExpiresAt(),
                p.getRevokedAt(),
                p.getStatus().name()
        );
    }
}
