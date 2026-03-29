package com.testrium.manager.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "test_executions")
public class TestExecution {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "test_run_id", nullable = false)
    private Long testRunId;

    @Column(name = "test_case_id", nullable = false)
    private Long testCaseId;

    @Column(name = "executed_by_user_id")
    private Long executedByUserId;

    @Column(nullable = false)
    private String status = "NOT_EXECUTED"; // PASS, FAIL, BLOCKED, SKIPPED, NOT_EXECUTED

    @Column(name = "actual_result", columnDefinition = "TEXT")
    private String actualResult;

    @Column(columnDefinition = "TEXT")
    private String comments;

    @Column(name = "execution_time_minutes")
    private Integer executionTimeMinutes;

    @Column(name = "defect_reference")
    private String defectReference;

    @Column(name = "executed_at")
    private LocalDateTime executedAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Constructors
    public TestExecution() {}

    public TestExecution(Long testRunId, Long testCaseId) {
        this.testRunId = testRunId;
        this.testCaseId = testCaseId;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getTestRunId() {
        return testRunId;
    }

    public void setTestRunId(Long testRunId) {
        this.testRunId = testRunId;
    }

    public Long getTestCaseId() {
        return testCaseId;
    }

    public void setTestCaseId(Long testCaseId) {
        this.testCaseId = testCaseId;
    }

    public Long getExecutedByUserId() {
        return executedByUserId;
    }

    public void setExecutedByUserId(Long executedByUserId) {
        this.executedByUserId = executedByUserId;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getActualResult() {
        return actualResult;
    }

    public void setActualResult(String actualResult) {
        this.actualResult = actualResult;
    }

    public String getComments() {
        return comments;
    }

    public void setComments(String comments) {
        this.comments = comments;
    }

    public Integer getExecutionTimeMinutes() {
        return executionTimeMinutes;
    }

    public void setExecutionTimeMinutes(Integer executionTimeMinutes) {
        this.executionTimeMinutes = executionTimeMinutes;
    }

    public String getDefectReference() {
        return defectReference;
    }

    public void setDefectReference(String defectReference) {
        this.defectReference = defectReference;
    }

    public LocalDateTime getExecutedAt() {
        return executedAt;
    }

    public void setExecutedAt(LocalDateTime executedAt) {
        this.executedAt = executedAt;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
