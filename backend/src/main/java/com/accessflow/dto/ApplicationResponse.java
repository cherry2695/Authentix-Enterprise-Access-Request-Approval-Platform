package com.accessflow.dto;

public record ApplicationResponse(
        Long id,
        String name,
        String description,
        String category,
        Long ownerId,
        String ownerName,
        boolean active
) {
}
