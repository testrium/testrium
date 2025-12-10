package com.pramana.manager.dto;

import java.time.LocalDateTime;
import java.util.List;

public class TestRunReportDTO {
    private Long testRunId;
    private String testRunName;
    private String projectName;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime completedAt;
    private Long totalTestCases;
    private Long passedExecutions;
    private Long failedExecutions;
    private Long skippedExecutions;
    private Double passRate;
    private List<TestRunDetailDTO> testCases;

    public TestRunReportDTO() {}

    // Getters and Setters
    public Long getTestRunId() { return testRunId; }
    public void setTestRunId(Long testRunId) { this.testRunId = testRunId; }

    public String getTestRunName() { return testRunName; }
    public void setTestRunName(String testRunName) { this.testRunName = testRunName; }

    public String getProjectName() { return projectName; }
    public void setProjectName(String projectName) { this.projectName = projectName; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getCompletedAt() { return completedAt; }
    public void setCompletedAt(LocalDateTime completedAt) { this.completedAt = completedAt; }

    public Long getTotalTestCases() { return totalTestCases; }
    public void setTotalTestCases(Long totalTestCases) { this.totalTestCases = totalTestCases; }

    public Long getPassedExecutions() { return passedExecutions; }
    public void setPassedExecutions(Long passedExecutions) { this.passedExecutions = passedExecutions; }

    public Long getFailedExecutions() { return failedExecutions; }
    public void setFailedExecutions(Long failedExecutions) { this.failedExecutions = failedExecutions; }

    public Long getSkippedExecutions() { return skippedExecutions; }
    public void setSkippedExecutions(Long skippedExecutions) { this.skippedExecutions = skippedExecutions; }

    public Double getPassRate() { return passRate; }
    public void setPassRate(Double passRate) { this.passRate = passRate; }

    public List<TestRunDetailDTO> getTestCases() { return testCases; }
    public void setTestCases(List<TestRunDetailDTO> testCases) { this.testCases = testCases; }
}
