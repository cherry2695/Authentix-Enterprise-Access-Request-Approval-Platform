package com.accessflow.repository;

import com.accessflow.entity.ApplicationRole;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ApplicationRoleRepository extends JpaRepository<ApplicationRole, Long> {
    List<ApplicationRole> findByApplicationId(Long applicationId);
    List<ApplicationRole> findByApplicationIdAndActiveTrue(Long applicationId);
}
