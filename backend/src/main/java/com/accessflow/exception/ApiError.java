package com.accessflow.exception;

import java.time.LocalDateTime;
import java.util.List;

/** Consistent JSON error shape returned by every failed API call. */
public record ApiError(
        LocalDateTime timestamp,
        int status,
        String error,
        String message,
        String path,
        List<String> details
) {
}
