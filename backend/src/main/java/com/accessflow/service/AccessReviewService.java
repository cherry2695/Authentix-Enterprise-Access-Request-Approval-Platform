package com.accessflow.service;

import com.accessflow.audit.AuditAction;
import com.accessflow.audit.AuditService;
import com.accessflow.dto.AccessReviewItemResponse;
import com.accessflow.dto.AccessReviewResponse;
import com.accessflow.dto.CreateAccessReviewRequest;
import com.accessflow.dto.ReviewDecisionRequest;
import com.accessflow.entity.AccessReview;
import com.accessflow.entity.AccessReviewItem;
import com.accessflow.entity.User;
import com.accessflow.entity.UserPermission;
import com.accessflow.entity.enums.PermissionStatus;
import com.accessflow.entity.enums.ReviewDecision;
import com.accessflow.entity.enums.ReviewStatus;
import com.accessflow.entity.enums.UserRole;
import com.accessflow.exception.BadRequestException;
import com.accessflow.exception.ResourceNotFoundException;
import com.accessflow.exception.UnauthorizedActionException;
import com.accessflow.mapper.AccessReviewMapper;
import com.accessflow.repository.AccessReviewItemRepository;
import com.accessflow.repository.AccessReviewRepository;
import com.accessflow.repository.UserPermissionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;

@Service
public class AccessReviewService {

    private final AccessReviewRepository accessReviewRepository;
    private final AccessReviewItemRepository accessReviewItemRepository;
    private final UserPermissionRepository userPermissionRepository;
    private final AuditService auditService;
    private final PermissionService permissionService;

    public AccessReviewService(AccessReviewRepository accessReviewRepository,
                               AccessReviewItemRepository accessReviewItemRepository,
                               UserPermissionRepository userPermissionRepository,
                               AuditService auditService,
                               PermissionService permissionService) {
        this.accessReviewRepository = accessReviewRepository;
        this.accessReviewItemRepository = accessReviewItemRepository;
        this.userPermissionRepository = userPermissionRepository;
        this.auditService = auditService;
        this.permissionService = permissionService;
    }

    @Transactional
    public AccessReviewResponse createCampaign(User admin, CreateAccessReviewRequest request) {
        if (admin.getRole() != UserRole.ADMIN) {
            throw new UnauthorizedActionException("Only administrators can initiate access review campaigns.");
        }

        if (request.dueDate().isBefore(request.startDate())) {
            throw new BadRequestException("Due date cannot be before start date.");
        }

        AccessReview review = AccessReview.builder()
                .campaignName(request.campaignName())
                .description(request.description())
                .createdBy(admin)
                .startDate(request.startDate())
                .dueDate(request.dueDate())
                .status(ReviewStatus.IN_PROGRESS)
                .build();
        review = accessReviewRepository.save(review);

        // Populate review items for all active permissions
        List<UserPermission> activePermissions = userPermissionRepository.findByStatus(PermissionStatus.ACTIVE);
        for (UserPermission p : activePermissions) {
            AccessReviewItem item = AccessReviewItem.builder()
                    .review(review)
                    .permission(p)
                    .decision(ReviewDecision.PENDING)
                    .build();
            accessReviewItemRepository.save(item);
        }

        auditService.record(admin, "ACCESS_REVIEW_CREATED", "AccessReview", review.getId(),
                null, review.getStatus().name(), "Created campaign with " + activePermissions.size() + " items", null);

        return toEnrichedResponse(review);
    }

    public List<AccessReviewResponse> getAllCampaigns() {
        return accessReviewRepository.findAll().stream()
                .sorted(Comparator.comparing(AccessReview::getCreatedAt).reversed())
                .map(this::toEnrichedResponse)
                .toList();
    }

    public AccessReviewResponse getCampaignById(Long id) {
        AccessReview review = accessReviewRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Access review campaign not found."));
        return toEnrichedResponse(review);
    }

    public List<AccessReviewItemResponse> getCampaignItems(Long campaignId) {
        accessReviewRepository.findById(campaignId)
                .orElseThrow(() -> new ResourceNotFoundException("Access review campaign not found."));

        return accessReviewItemRepository.findByReviewId(campaignId).stream()
                .map(AccessReviewMapper::toItemResponse)
                .toList();
    }

    @Transactional
    public AccessReviewItemResponse submitItemDecision(Long campaignId, Long itemId, User reviewer, ReviewDecisionRequest request) {
        if (reviewer.getRole() != UserRole.ADMIN && reviewer.getRole() != UserRole.MANAGER) {
            throw new UnauthorizedActionException("Only managers or administrators can review access items.");
        }

        AccessReview review = accessReviewRepository.findById(campaignId)
                .orElseThrow(() -> new ResourceNotFoundException("Access review campaign not found."));

        if (review.getStatus() == ReviewStatus.COMPLETED) {
            throw new BadRequestException("This access review campaign has already been completed.");
        }

        AccessReviewItem item = accessReviewItemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Access review item not found."));

        if (!item.getReview().getId().equals(campaignId)) {
            throw new BadRequestException("Item does not belong to this campaign.");
        }

        item.setReviewer(reviewer);
        item.setDecision(request.decision());
        item.setComments(request.comments());
        item.setReviewedAt(LocalDateTime.now());
        item = accessReviewItemRepository.save(item);

        // If flagged for revocation, optionally revoke active permission directly
        if (request.decision() == ReviewDecision.FLAGGED_FOR_REVOCATION) {
            if (item.getPermission().getStatus() == PermissionStatus.ACTIVE) {
                permissionService.revokePermission(item.getPermission().getId(), reviewer,
                        new com.accessflow.dto.RevokePermissionRequest("Flagged during access review campaign: " + review.getCampaignName()));
            }
        }

        // Check if all items in this campaign are completed
        long pendingRemaining = accessReviewItemRepository.countByReviewIdAndDecision(campaignId, ReviewDecision.PENDING);
        if (pendingRemaining == 0) {
            review.setStatus(ReviewStatus.COMPLETED);
            accessReviewRepository.save(review);
            auditService.record(reviewer, AuditAction.ACCESS_REVIEW_COMPLETED, "AccessReview", review.getId(),
                    ReviewStatus.IN_PROGRESS.name(), ReviewStatus.COMPLETED.name(), "All items reviewed", null);
        }

        return AccessReviewMapper.toItemResponse(item);
    }

    private AccessReviewResponse toEnrichedResponse(AccessReview review) {
        long total = accessReviewItemRepository.countByReviewId(review.getId());
        long pending = accessReviewItemRepository.countByReviewIdAndDecision(review.getId(), ReviewDecision.PENDING);
        long approved = accessReviewItemRepository.countByReviewIdAndDecision(review.getId(), ReviewDecision.APPROVED_RETAIN);
        long revoked = accessReviewItemRepository.countByReviewIdAndDecision(review.getId(), ReviewDecision.FLAGGED_FOR_REVOCATION);
        return AccessReviewMapper.toResponse(review, total, pending, approved, revoked);
    }
}
