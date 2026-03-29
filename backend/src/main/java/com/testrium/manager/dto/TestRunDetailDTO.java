package com.testrium.manager.dto;

import java.time.LocalDateTime;

public class TestRunDetailDTO {
    private Long testCaseId;
    private String testCaseName;
    private String testCaseDescription;
    private String priority;
    private String status;
    private String actualResult;
    private String comments;
    private String executedByName;
    private LocalDateTime executedAt;
    private Integer executionTimeMinutes;
    private String defectReference;

    public TestRunDetailDTO() {}

    public TestRunDetailDTO(Long testCaseId, String testCaseName, String testCaseDescription,
                           String priority, String status, String actualResult, String comments,
                           String executedByName, LocalDateTime executedAt, Integer executionTimeMinutes,
                           String defectReference) {
        this.testCaseId = testCaseId;
        this.testCaseName = testCaseName;
        this.testCaseDescription = testCaseDescription;
        this.priority = priority;
        this.status = status;
        this.actualResult = actualResult;
        this.comments = comments;
        this.executedByName = executedByName;
        this.executedAt = executedAt;
        this.executionTimeMinutes = executionTimeMinutes;
        this.defectReference = defectReference;
    }

    // Getters and Setters
    public Long getTestCaseId() { return testCaseId; }
    public void setTestCaseId(Long testCaseId) { this.testCaseId = testCaseId; }

    public String getTestCaseName() { return testCaseName; }
    public void setTestCaseName(String testCaseName) { this.testCaseName = testCaseName; }

    public String getTestCaseDescription() { return testCaseDescription; }
    public void setTestCaseDescription(String testCaseDescription) { this.testCaseDescription = testCaseDescription; }

    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getActualResult() { return actualResult; }
    public void setActualResult(String actualResult) { this.actualResult = actualResult; }

    public String getComments() { return comments; }
    public void setComments(String comments) { this.comments = comments; }

    public String getExecutedByName() { return executedByName; }
    public void setExecutedByName(String executedByName) { this.executedByName = executedByName; }

    public LocalDateTime getExecutedAt() { return executedAt; }
    public void setExecutedAt(LocalDateTime executedAt) { this.executedAt = executedAt; }

    public Integer getExecutionTimeMinutes() { return executionTimeMinutes; }
    public void setExecutionTimeMinutes(Integer executionTimeMinutes) { this.executionTimeMinutes = executionTimeMinutes; }

    public String getDefectReference() { return defectReference; }
    public void setDefectReference(String defectReference) { this.defectReference = defectReference; }
}
