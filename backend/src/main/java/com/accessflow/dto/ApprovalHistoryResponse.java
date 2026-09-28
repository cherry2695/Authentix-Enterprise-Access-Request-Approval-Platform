package com.accessflow.dto;

import java.time.LocalDateTime;

public record ApprovalHistoryResponse(
        Long id,
        Long accessRequestId,
        Long approverId,
        String approverName,
        String approverEmail,
        String approvalStage,
        String decision,
        String comments,
        LocalDateTime decidedAt
) {
}
