package com.accessflow.mapper;

import com.accessflow.dto.ApplicationRoleResponse;
import com.accessflow.entity.ApplicationRole;

public final class ApplicationRoleMapper {

    private ApplicationRoleMapper() {
    }

    public static ApplicationRoleResponse toResponse(ApplicationRole role) {
        if (role == null) return null;
        return new ApplicationRoleResponse(
                role.getId(),
                role.getApplication().getId(),
                role.getRoleName(),
                role.getDescription(),
                role.isActive()
        );
    }
}
