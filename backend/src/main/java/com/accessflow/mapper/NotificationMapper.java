package com.accessflow.mapper;

import com.accessflow.dto.NotificationResponse;
import com.accessflow.entity.Notification;

public final class NotificationMapper {

    private NotificationMapper() {
    }

    public static NotificationResponse toResponse(Notification n) {
        if (n == null) return null;
        return new NotificationResponse(
                n.getId(),
                n.getTitle(),
                n.getMessage(),
                n.getNotificationType().name(),
                n.getReferenceId(),
                n.isReadStatus(),
                n.getCreatedAt()
        );
    }
}
