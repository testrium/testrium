package com.pramana.manager.dto;

import java.time.LocalDateTime;

public class TestExecutionDTO {
    private Long id;
    private Long testRunId;
    private Long testCaseId;
    private String testCaseTitle;
    private String testCaseSteps;
    private String testCaseExpectedResult;
    private String testCasePreconditions;
    private Long executedByUserId;
    private String executedByUsername;
    private String status;
    private String actualResult;
    private String comments;
    private Integer executionTimeMinutes;
    private String defectReference;
    private LocalDateTime executedAt;

    public TestExecutionDTO() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getTestRunId() { return testRunId; }
    public void setTestRunId(Long testRunId) { this.testRunId = testRunId; }

    public Long getTestCaseId() { return testCaseId; }
    public void setTestCaseId(Long testCaseId) { this.testCaseId = testCaseId; }

    public String getTestCaseTitle() { return testCaseTitle; }
    public void setTestCaseTitle(String testCaseTitle) { this.testCaseTitle = testCaseTitle; }

    public String getTestCaseSteps() { return testCaseSteps; }
    public void setTestCaseSteps(String testCaseSteps) { this.testCaseSteps = testCaseSteps; }

    public String getTestCaseExpectedResult() { return testCaseExpectedResult; }
    public void setTestCaseExpectedResult(String testCaseExpectedResult) { this.testCaseExpectedResult = testCaseExpectedResult; }

    public String getTestCasePreconditions() { return testCasePreconditions; }
    public void setTestCasePreconditions(String testCasePreconditions) { this.testCasePreconditions = testCasePreconditions; }

    public Long getExecutedByUserId() { return executedByUserId; }
    public void setExecutedByUserId(Long executedByUserId) { this.executedByUserId = executedByUserId; }

    public String getExecutedByUsername() { return executedByUsername; }
    public void setExecutedByUsername(String executedByUsername) { this.executedByUsername = executedByUsername; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getActualResult() { return actualResult; }
    public void setActualResult(String actualResult) { this.actualResult = actualResult; }

    public String getComments() { return comments; }
    public void setComments(String comments) { this.comments = comments; }

    public Integer getExecutionTimeMinutes() { return executionTimeMinutes; }
    public void setExecutionTimeMinutes(Integer executionTimeMinutes) { this.executionTimeMinutes = executionTimeMinutes; }

    public String getDefectReference() { return defectReference; }
    public void setDefectReference(String defectReference) { this.defectReference = defectReference; }

    public LocalDateTime getExecutedAt() { return executedAt; }
    public void setExecutedAt(LocalDateTime executedAt) { this.executedAt = executedAt; }
}
