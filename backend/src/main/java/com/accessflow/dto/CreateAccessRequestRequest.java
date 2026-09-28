package com.accessflow.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CreateAccessRequestRequest(
        @NotNull Long applicationId,
        @NotNull Long applicationRoleId,
        @NotBlank @Size(max = 1000, message = "Justification must be 1000 characters or fewer") String justification
) {
}
