package com.accessflow.mapper;

import com.accessflow.dto.ApplicationResponse;
import com.accessflow.entity.Application;
import com.accessflow.entity.User;

public final class ApplicationMapper {

    private ApplicationMapper() {
    }

    public static ApplicationResponse toResponse(Application app) {
        if (app == null) return null;
        User owner = app.getOwner();
        return new ApplicationResponse(
                app.getId(),
                app.getName(),
                app.getDescription(),
                app.getCategory(),
                owner != null ? owner.getId() : null,
                owner != null ? owner.getFullName() : null,
                app.isActive()
        );
    }
}
