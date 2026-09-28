package com.accessflow.entity.enums;

/** Lifecycle states of an AccessRequest. */
public enum RequestStatus {
    PENDING_MANAGER_APPROVAL,
    PENDING_ADMIN_APPROVAL,
    ACCESS_GRANTED,
    REJECTED,
    CANCELLED
}
