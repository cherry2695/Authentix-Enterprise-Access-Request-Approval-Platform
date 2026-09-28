package com.accessflow.dto;

import com.accessflow.entity.enums.ReviewDecision;
import jakarta.validation.constraints.NotNull;

public record ReviewDecisionRequest(
        @NotNull(message = "Review decision is required (APPROVED_RETAIN or FLAGGED_FOR_REVOCATION)")
        ReviewDecision decision,
        String comments
) {
}
