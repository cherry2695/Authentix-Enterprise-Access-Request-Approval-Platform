package com.accessflow.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record UpdateApplicationRoleRequest(
        @NotBlank @Size(max = 100) String roleName,
        @Size(max = 500) String description,
        @NotNull Boolean active
) {
}
