package com.accessflow.dto;

import java.time.LocalDateTime;

public record NotificationResponse(
        Long id,
        String title,
        String message,
        String notificationType,
        Long referenceId,
        boolean readStatus,
        LocalDateTime createdAt
) {
}
