package com.accessflow.exception;

/**
 * Thrown when an authenticated user attempts an operation they are not
 * permitted to perform (e.g. a manager approving someone else's team,
 * an employee approving their own request). Distinct from Spring
 * Security's 401/403 for unauthenticated/role-based access, this covers
 * ownership-level checks made inside service logic.
 */
public class UnauthorizedActionException extends RuntimeException {
    public UnauthorizedActionException(String message) {
        super(message);
    }
}
