package com.pramana.manager.repository;

import com.pramana.manager.entity.TestData;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TestDataRepository extends JpaRepository<TestData, Long> {
    List<TestData> findByProjectIdAndIsActiveTrue(Long projectId);
    List<TestData> findByProjectIdAndEnvironmentAndIsActiveTrue(Long projectId, String environment);
}
