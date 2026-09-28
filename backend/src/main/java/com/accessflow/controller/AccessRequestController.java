package com.accessflow.controller;

import com.accessflow.dto.AccessRequestResponse;
import com.accessflow.dto.CreateAccessRequestRequest;
import com.accessflow.dto.PageResponse;
import com.accessflow.entity.enums.RequestStatus;
import com.accessflow.security.CustomUserDetails;
import com.accessflow.service.AccessRequestService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/access-requests")
public class AccessRequestController {

    private final AccessRequestService accessRequestService;

    public AccessRequestController(AccessRequestService accessRequestService) {
        this.accessRequestService = accessRequestService;
    }

    @PostMapping
    public ResponseEntity<AccessRequestResponse> create(@Valid @RequestBody CreateAccessRequestRequest request,
                                                         @AuthenticationPrincipal CustomUserDetails principal) {
        AccessRequestResponse created = accessRequestService.createRequest(principal.getUser(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping("/my")
    public ResponseEntity<List<AccessRequestResponse>> myRequests(@AuthenticationPrincipal CustomUserDetails principal) {
        return ResponseEntity.ok(accessRequestService.getMyRequests(principal.getUser()));
    }

    /** Administrative oversight: every request in the system, optionally filtered by status. */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PageResponse<AccessRequestResponse>> listAll(
            @RequestParam(required = false) RequestStatus status,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(accessRequestService.listAll(status, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<AccessRequestResponse> getById(@PathVariable Long id,
                                                          @AuthenticationPrincipal CustomUserDetails principal) {
        return ResponseEntity.ok(accessRequestService.getById(id, principal.getUser()));
    }

    @PatchMapping("/{id}/cancel")
    public ResponseEntity<AccessRequestResponse> cancel(@PathVariable Long id,
                                                         @AuthenticationPrincipal CustomUserDetails principal) {
        return ResponseEntity.ok(accessRequestService.cancel(id, principal.getUser()));
    }
}
