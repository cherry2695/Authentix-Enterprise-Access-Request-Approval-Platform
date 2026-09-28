package com.accessflow.dto;

import java.util.List;

public record EmployeeDashboardStats(
        long totalRequests,
        long pendingRequests,
        long approvedRequests,
        long rejectedRequests,
        long activePermissions,
        long unreadNotifications,
        List<AccessRequestResponse> recentRequests,
        List<UserPermissionResponse> activePermissionsList
) {
}
