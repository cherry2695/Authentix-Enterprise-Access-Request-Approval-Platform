package com.accessflow.mapper;

import com.accessflow.dto.UserResponse;
import com.accessflow.entity.User;

public final class UserMapper {

    private UserMapper() {
    }

    public static UserResponse toResponse(User user) {
        if (user == null) return null;
        User manager = user.getManager();
        return new UserResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getRole().name(),
                manager != null ? manager.getId() : null,
                manager != null ? manager.getFullName() : null,
                user.isActive()
        );
    }
}
