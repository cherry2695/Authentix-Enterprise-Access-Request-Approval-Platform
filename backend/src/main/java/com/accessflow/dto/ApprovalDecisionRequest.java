package com.accessflow.dto;

import com.accessflow.entity.enums.ApprovalDecision;
import jakarta.validation.constraints.NotNull;

public record ApprovalDecisionRequest(
        @NotNull(message = "Decision is required (APPROVED or REJECTED)")
        ApprovalDecision decision,
        String comments
) {
}
