package com.accessflow.dto;

import java.time.LocalDateTime;

public record AccessReviewItemResponse(
        Long id,
        Long reviewId,
        Long permissionId,
        Long userId,
        String userName,
        String userEmail,
        String applicationName,
        String roleName,
        Long reviewerId,
        String reviewerName,
        String decision,
        String comments,
        LocalDateTime reviewedAt
) {
}
