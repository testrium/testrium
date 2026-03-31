package com.testrium.manager.repository;

import com.testrium.manager.entity.TestCase;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Set;

@Repository
public interface TestCaseRepository extends JpaRepository<TestCase, Long> {

    List<TestCase> findByProjectId(Long projectId);

    List<TestCase> findByModuleId(Long moduleId);

    List<TestCase> findByProjectIdAndStatus(Long projectId, TestCase.TestCaseStatus status);

    List<TestCase> findByProjectIdAndPriority(Long projectId, TestCase.Priority priority);

    @Query("SELECT tc FROM TestCase tc WHERE tc.project.id = :projectId " +
           "AND (:moduleId IS NULL OR tc.module.id = :moduleId) " +
           "AND (:status IS NULL OR tc.status = :status) " +
           "AND (:priority IS NULL OR tc.priority = :priority)")
    List<TestCase> findByFilters(@Param("projectId") Long projectId,
                                 @Param("moduleId") Long moduleId,
                                 @Param("status") TestCase.TestCaseStatus status,
                                 @Param("priority") TestCase.Priority priority);

    @Query("SELECT DISTINCT tc FROM TestCase tc JOIN tc.tags t WHERE tc.project.id = :projectId " +
           "AND t = :tag " +
           "AND (:moduleId IS NULL OR tc.module.id = :moduleId) " +
           "AND (:status IS NULL OR tc.status = :status) " +
           "AND (:priority IS NULL OR tc.priority = :priority)")
    List<TestCase> findByFiltersAndTag(@Param("projectId") Long projectId,
                                       @Param("moduleId") Long moduleId,
                                       @Param("status") TestCase.TestCaseStatus status,
                                       @Param("priority") TestCase.Priority priority,
                                       @Param("tag") String tag);

    @Query("SELECT DISTINCT t FROM TestCase tc JOIN tc.tags t WHERE tc.project.id = :projectId ORDER BY t")
    List<String> findDistinctTagsByProjectId(@Param("projectId") Long projectId);

    long countByProjectId(Long projectId);

    long countByProjectIdAndStatus(Long projectId, TestCase.TestCaseStatus status);
}
