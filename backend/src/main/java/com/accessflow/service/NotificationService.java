package com.accessflow.service;

import com.accessflow.dto.NotificationResponse;
import com.accessflow.entity.Notification;
import com.accessflow.entity.User;
import com.accessflow.entity.enums.NotificationType;
import com.accessflow.exception.ResourceNotFoundException;
import com.accessflow.exception.UnauthorizedActionException;
import com.accessflow.mapper.NotificationMapper;
import com.accessflow.repository.NotificationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    @Transactional
    public void createNotification(User recipient, String title, String message, NotificationType type, Long referenceId) {
        if (recipient == null) return;
        Notification notification = Notification.builder()
                .user(recipient)
                .title(title)
                .message(message)
                .notificationType(type)
                .referenceId(referenceId)
                .readStatus(false)
                .build();
        notificationRepository.save(notification);
    }

    public List<NotificationResponse> getMyNotifications(User user) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream()
                .map(NotificationMapper::toResponse)
                .toList();
    }

    public long getUnreadCount(User user) {
        return notificationRepository.countByUserIdAndReadStatusFalse(user.getId());
    }

    @Transactional
    public NotificationResponse markAsRead(Long notificationId, User user) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found."));

        if (!notification.getUser().getId().equals(user.getId())) {
            throw new UnauthorizedActionException("You can only update your own notifications.");
        }

        notification.setReadStatus(true);
        notification = notificationRepository.save(notification);
        return NotificationMapper.toResponse(notification);
    }

    @Transactional
    public void markAllAsRead(User user) {
        List<Notification> unreadList = notificationRepository.findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream()
                .filter(n -> !n.isReadStatus())
                .toList();
        for (Notification n : unreadList) {
            n.setReadStatus(true);
        }
        notificationRepository.saveAll(unreadList);
    }
}
