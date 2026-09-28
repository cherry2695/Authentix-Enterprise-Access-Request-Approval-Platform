package com.accessflow.dto;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public record CreateAccessReviewRequest(
        @NotBlank(message = "Campaign name is required")
        String campaignName,
        String description,
        @NotNull(message = "Start date is required")
        LocalDate startDate,
        @NotNull(message = "Due date is required")
        @FutureOrPresent(message = "Due date must be today or in the future")
        LocalDate dueDate
) {
}
