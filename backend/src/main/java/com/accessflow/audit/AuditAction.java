package com.accessflow.audit;

/** String constants for the `action` column of audit_logs. Kept as plain
 * strings (not an enum) so future event types can be added without a
 * schema/enum migration. */
public final class AuditAction {
    private AuditAction() {
    }

    public static final String USER_LOGIN = "USER_LOGIN";
    public static final String USER_LOGIN_FAILED = "USER_LOGIN_FAILED";
    public static final String USER_REGISTERED = "USER_REGISTERED";
    public static final String ACCESS_REQUEST_CREATED = "ACCESS_REQUEST_CREATED";
    public static final String ACCESS_REQUEST_CANCELLED = "ACCESS_REQUEST_CANCELLED";
    public static final String MANAGER_APPROVED = "MANAGER_APPROVED";
    public static final String MANAGER_REJECTED = "MANAGER_REJECTED";
    public static final String ADMIN_APPROVED = "ADMIN_APPROVED";
    public static final String ADMIN_REJECTED = "ADMIN_REJECTED";
    public static final String PERMISSION_GRANTED = "PERMISSION_GRANTED";
    public static final String PERMISSION_REVOKED = "PERMISSION_REVOKED";
    public static final String USER_ROLE_UPDATED = "USER_ROLE_UPDATED";
    public static final String APPLICATION_CREATED = "APPLICATION_CREATED";
    public static final String APPLICATION_UPDATED = "APPLICATION_UPDATED";
    public static final String APPLICATION_ROLE_CREATED = "APPLICATION_ROLE_CREATED";
    public static final String APPLICATION_ROLE_UPDATED = "APPLICATION_ROLE_UPDATED";
    public static final String ACCESS_REVIEW_COMPLETED = "ACCESS_REVIEW_COMPLETED";
}
