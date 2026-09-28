package com.accessflow.dto;

import java.util.List;

public record AdminDashboardStats(
        long totalUsers,
        long activeApplications,
        long pendingManagerApprovals,
        long pendingAdminApprovals,
        long totalApprovedRequests,
        long totalRejectedRequests,
        long activePermissions,
        long revokedPermissions,
        long activeReviewCampaigns,
        List<AccessRequestResponse> pendingAdminQueue,
        List<AuditLogResponse> recentAuditEvents
) {
}
