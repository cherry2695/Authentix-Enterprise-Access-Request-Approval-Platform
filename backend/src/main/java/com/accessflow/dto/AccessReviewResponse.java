package com.accessflow.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record AccessReviewResponse(
        Long id,
        String campaignName,
        String description,
        Long createdById,
        String createdByName,
        LocalDate startDate,
        LocalDate dueDate,
        String status,
        LocalDateTime createdAt,
        long totalItems,
        long pendingItems,
        long approvedItems,
        long revokedItems
) {
}
