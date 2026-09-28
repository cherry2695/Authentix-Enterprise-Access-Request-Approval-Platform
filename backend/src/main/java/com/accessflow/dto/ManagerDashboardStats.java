package com.accessflow.dto;

import java.util.List;

public record ManagerDashboardStats(
        long pendingApprovals,
        long totalTeamMembers,
        long teamRequestsTotal,
        long approvedRequests,
        long rejectedRequests,
        List<AccessRequestResponse> pendingQueue,
        List<AccessRequestResponse> recentTeamRequests
) {
}
