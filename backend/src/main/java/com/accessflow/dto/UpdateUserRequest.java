package com.accessflow.dto;

import com.accessflow.entity.enums.UserRole;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record UpdateUserRequest(
        @NotBlank(message = "Full name is required")
        @Size(max = 150, message = "Full name cannot exceed 150 characters")
        String fullName,

        @NotNull(message = "Role is required")
        UserRole role,

        Long managerId,

        Boolean active
) {
}
