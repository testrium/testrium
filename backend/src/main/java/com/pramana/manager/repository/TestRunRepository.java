package com.pramana.manager.repository;

import com.pramana.manager.entity.TestRun;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TestRunRepository extends JpaRepository<TestRun, Long> {
    List<TestRun> findByProjectId(Long projectId);
    List<TestRun> findByProjectIdAndStatus(Long projectId, String status);
    List<TestRun> findByAssignedToUserId(Long userId);
    List<TestRun> findByCreatedByUserId(Long userId);
}
