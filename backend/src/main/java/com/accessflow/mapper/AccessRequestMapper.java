package com.accessflow.mapper;

import com.accessflow.dto.AccessRequestResponse;
import com.accessflow.entity.AccessRequest;
import com.accessflow.entity.User;

public final class AccessRequestMapper {

    private AccessRequestMapper() {
    }

    public static AccessRequestResponse toResponse(AccessRequest req) {
        if (req == null) return null;
        User manager = req.getAssignedManager();
        return new AccessRequestResponse(
                req.getId(),
                req.getRequester().getId(),
                req.getRequester().getFullName(),
                req.getApplication().getId(),
                req.getApplication().getName(),
                req.getApplicationRole().getId(),
                req.getApplicationRole().getRoleName(),
                req.getJustification(),
                req.getStatus().name(),
                manager != null ? manager.getId() : null,
                manager != null ? manager.getFullName() : null,
                req.getSubmittedAt(),
                req.getUpdatedAt(),
                req.getExpiresAt()
        );
    }
}
