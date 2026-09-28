package com.accessflow.controller;

import com.accessflow.dto.AccessReviewItemResponse;
import com.accessflow.dto.AccessReviewResponse;
import com.accessflow.dto.CreateAccessReviewRequest;
import com.accessflow.dto.ReviewDecisionRequest;
import com.accessflow.security.CustomUserDetails;
import com.accessflow.service.AccessReviewService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/access-reviews")
public class AccessReviewController {

    private final AccessReviewService accessReviewService;

    public AccessReviewController(AccessReviewService accessReviewService) {
        this.accessReviewService = accessReviewService;
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AccessReviewResponse> createCampaign(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody CreateAccessReviewRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(accessReviewService.createCampaign(userDetails.getUser(), request));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    public ResponseEntity<List<AccessReviewResponse>> getAllCampaigns() {
        return ResponseEntity.ok(accessReviewService.getAllCampaigns());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    public ResponseEntity<AccessReviewResponse> getCampaignById(@PathVariable Long id) {
        return ResponseEntity.ok(accessReviewService.getCampaignById(id));
    }

    @GetMapping("/{id}/items")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    public ResponseEntity<List<AccessReviewItemResponse>> getCampaignItems(@PathVariable Long id) {
        return ResponseEntity.ok(accessReviewService.getCampaignItems(id));
    }

    @PostMapping("/{id}/items/{itemId}/decision")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    public ResponseEntity<AccessReviewItemResponse> submitItemDecision(
            @PathVariable Long id,
            @PathVariable Long itemId,
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody ReviewDecisionRequest request) {
        return ResponseEntity.ok(accessReviewService.submitItemDecision(id, itemId, userDetails.getUser(), request));
    }
}
