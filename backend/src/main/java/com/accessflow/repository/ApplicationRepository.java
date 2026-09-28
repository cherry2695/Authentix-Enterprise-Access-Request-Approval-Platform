package com.accessflow.repository;

import com.accessflow.entity.Application;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ApplicationRepository extends JpaRepository<Application, Long> {
    List<Application> findByActiveTrue();
    List<Application> findByCategoryIgnoreCase(String category);
}
