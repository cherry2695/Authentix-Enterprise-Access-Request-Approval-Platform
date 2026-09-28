package com.accessflow.repository;

import com.accessflow.entity.UserPermission;
import com.accessflow.entity.enums.PermissionStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UserPermissionRepository extends JpaRepository<UserPermission, Long> {
    List<UserPermission> findByUserId(Long userId);
    List<UserPermission> findByUserIdAndStatus(Long userId, PermissionStatus status);
    List<UserPermission> findByStatus(PermissionStatus status);
    long countByStatus(PermissionStatus status);
    long countByUserIdAndStatus(Long userId, PermissionStatus status);
}
