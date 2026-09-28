package com.accessflow.repository;

import com.accessflow.entity.AccessReview;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AccessReviewRepository extends JpaRepository<AccessReview, Long> {
}
