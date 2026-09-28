package com.accessflow.repository;

import com.accessflow.entity.AccessReviewItem;
import com.accessflow.entity.enums.ReviewDecision;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AccessReviewItemRepository extends JpaRepository<AccessReviewItem, Long> {
    List<AccessReviewItem> findByReviewId(Long reviewId);
    long countByReviewId(Long reviewId);
    long countByReviewIdAndDecision(Long reviewId, ReviewDecision decision);
}
