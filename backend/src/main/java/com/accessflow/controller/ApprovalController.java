package com.accessflow.controller;

import com.accessflow.dto.AccessRequestResponse;
import com.accessflow.dto.ApprovalDecisionRequest;
import com.accessflow.dto.ApprovalHistoryResponse;
import com.accessflow.security.CustomUserDetails;
import com.accessflow.service.ApprovalService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/approvals")
public class ApprovalController {

    private final ApprovalService approvalService;

    public ApprovalController(ApprovalService approvalService) {
        this.approvalService = approvalService;
    }

    /**
     * Get pending approvals for the caller:
     * - Managers get requests awaiting manager approval assigned to them.
     * - Admins get requests awaiting admin approval.
     */
    @GetMapping("/pending")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    public ResponseEntity<List<AccessRequestResponse>> getPendingApprovals(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(approvalService.getPendingApprovals(userDetails.getUser()));
    }

    /**
     * Manager decision (APPROVE or REJECT).
     */
    @PostMapping("/{id}/manager-decision")
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<AccessRequestResponse> processManagerDecision(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody ApprovalDecisionRequest request) {
        return ResponseEntity.ok(approvalService.processManagerDecision(id, userDetails.getUser(), request));
    }

    /**
     * Admin decision (APPROVE or REJECT). On APPROVE, permission is atomically granted.
     */
    @PostMapping("/{id}/admin-decision")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AccessRequestResponse> processAdminDecision(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody ApprovalDecisionRequest request) {
        return ResponseEntity.ok(approvalService.processAdminDecision(id, userDetails.getUser(), request));
    }

    /**
     * Get approval history for a specific request.
     */
    @GetMapping("/{id}/history")
    public ResponseEntity<List<ApprovalHistoryResponse>> getApprovalHistory(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(approvalService.getApprovalHistory(id, userDetails.getUser()));
    }

    /**
     * Get team requests for a manager or admin.
     */
    @GetMapping("/team")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    public ResponseEntity<List<AccessRequestResponse>> getTeamRequests(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(approvalService.getTeamRequests(userDetails.getUser()));
    }
}
