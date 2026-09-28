package com.accessflow.mapper;

import com.accessflow.dto.AccessReviewItemResponse;
import com.accessflow.dto.AccessReviewResponse;
import com.accessflow.entity.AccessReview;
import com.accessflow.entity.AccessReviewItem;
import com.accessflow.entity.User;
import com.accessflow.entity.UserPermission;

public final class AccessReviewMapper {

    private AccessReviewMapper() {
    }

    public static AccessReviewResponse toResponse(AccessReview r, long total, long pending, long approved, long revoked) {
        if (r == null) return null;
        User creator = r.getCreatedBy();
        return new AccessReviewResponse(
                r.getId(),
                r.getCampaignName(),
                r.getDescription(),
                creator != null ? creator.getId() : null,
                creator != null ? creator.getFullName() : null,
                r.getStartDate(),
                r.getDueDate(),
                r.getStatus().name(),
                r.getCreatedAt(),
                total,
                pending,
                approved,
                revoked
        );
    }

    public static AccessReviewItemResponse toItemResponse(AccessReviewItem item) {
        if (item == null) return null;
        UserPermission p = item.getPermission();
        User reviewer = item.getReviewer();
        return new AccessReviewItemResponse(
                item.getId(),
                item.getReview().getId(),
                p.getId(),
                p.getUser().getId(),
                p.getUser().getFullName(),
                p.getUser().getEmail(),
                p.getApplication().getName(),
                p.getApplicationRole().getRoleName(),
                reviewer != null ? reviewer.getId() : null,
                reviewer != null ? reviewer.getFullName() : null,
                item.getDecision().name(),
                item.getComments(),
                item.getReviewedAt()
        );
    }
}
