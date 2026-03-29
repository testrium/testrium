package com.testrium.manager.repository;

import com.testrium.manager.entity.AutomationComment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AutomationCommentRepository extends JpaRepository<AutomationComment, Long> {

    // Get current comment for a test case
    Optional<AutomationComment> findByTestCaseIdAndIsCurrentTrue(Long testCaseId);

    // Get all comments (history) for a test case, ordered by most recent first
    List<AutomationComment> findByTestCaseIdOrderByCreatedAtDesc(Long testCaseId);

    // Mark all current comments as historical for a test case
    @Modifying
    @Query("UPDATE AutomationComment ac SET ac.isCurrent = false WHERE ac.testCase.id = :testCaseId AND ac.isCurrent = true")
    void markAllAsHistorical(@Param("testCaseId") Long testCaseId);

    // Get all current comments for test cases in a project
    @Query("SELECT ac FROM AutomationComment ac WHERE ac.testCase.project.id = :projectId AND ac.isCurrent = true")
    List<AutomationComment> findCurrentCommentsByProjectId(@Param("projectId") Long projectId);
}
