package com.accessflow.repository;

import com.accessflow.entity.AccessRequest;
import com.accessflow.entity.enums.RequestStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AccessRequestRepository extends JpaRepository<AccessRequest, Long> {

    List<AccessRequest> findByRequesterId(Long requesterId);

    List<AccessRequest> findByAssignedManagerId(Long managerId);

    List<AccessRequest> findByAssignedManagerIdAndStatus(Long managerId, RequestStatus status);

    Page<AccessRequest> findByAssignedManagerIdAndStatus(Long managerId, RequestStatus status, Pageable pageable);

    Page<AccessRequest> findByStatus(RequestStatus status, Pageable pageable);

    List<AccessRequest> findByStatus(RequestStatus status);

    long countByStatus(RequestStatus status);

    long countByAssignedManagerIdAndStatus(Long managerId, RequestStatus status);

    long countByRequesterId(Long requesterId);

    long countByRequesterIdAndStatus(Long requesterId, RequestStatus status);

    Optional<AccessRequest> findByRequesterIdAndApplicationIdAndApplicationRoleIdAndStatusIn(
            Long requesterId, Long applicationId, Long applicationRoleId, List<RequestStatus> statuses);
}
