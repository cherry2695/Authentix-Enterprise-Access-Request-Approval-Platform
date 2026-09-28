package com.accessflow.mapper;

import com.accessflow.dto.ApprovalHistoryResponse;
import com.accessflow.entity.ApprovalHistory;
import com.accessflow.entity.User;

public final class ApprovalHistoryMapper {

    private ApprovalHistoryMapper() {
    }

    public static ApprovalHistoryResponse toResponse(ApprovalHistory history) {
        if (history == null) return null;
        User approver = history.getApprover();
        return new ApprovalHistoryResponse(
                history.getId(),
                history.getAccessRequest().getId(),
                approver != null ? approver.getId() : null,
                approver != null ? approver.getFullName() : null,
                approver != null ? approver.getEmail() : null,
                history.getApprovalStage().name(),
                history.getDecision().name(),
                history.getComments(),
                history.getDecidedAt()
        );
    }
}
