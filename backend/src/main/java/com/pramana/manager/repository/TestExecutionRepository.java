package com.pramana.manager.repository;

import com.pramana.manager.entity.TestExecution;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TestExecutionRepository extends JpaRepository<TestExecution, Long> {
    List<TestExecution> findByTestRunId(Long testRunId);
    Optional<TestExecution> findByTestRunIdAndTestCaseId(Long testRunId, Long testCaseId);
    List<TestExecution> findByTestCaseId(Long testCaseId);
    List<TestExecution> findByExecutedByUserId(Long userId);
    List<TestExecution> findByTestRunIdAndStatus(Long testRunId, String status);
}
