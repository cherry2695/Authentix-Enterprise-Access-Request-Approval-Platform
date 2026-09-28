package com.accessflow.repository;

import com.accessflow.entity.ApprovalHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ApprovalHistoryRepository extends JpaRepository<ApprovalHistory, Long> {
    List<ApprovalHistory> findByAccessRequestIdOrderByDecidedAtAsc(Long accessRequestId);
}
