package com.pramana.manager.dto;

import java.time.LocalDateTime;

public class TestRunDTO {
    private Long id;
    private String name;
    private String description;
    private Long projectId;
    private String projectName;
    private Long suiteId;
    private String suiteName;
    private Long assignedToUserId;
    private String assignedToUsername;
    private String status;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private Long createdByUserId;
    private String createdByUsername;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Execution statistics
    private Integer totalTestCases;
    private Integer passedCount;
    private Integer failedCount;
    private Integer blockedCount;
    private Integer skippedCount;
    private Integer notExecutedCount;

    public TestRunDTO() {}

    public TestRunDTO(Long id, String name, String description, Long projectId, String projectName,
                      Long suiteId, String suiteName, Long assignedToUserId, String assignedToUsername,
                      String status, LocalDateTime startDate, LocalDateTime endDate,
                      Long createdByUserId, String createdByUsername,
                      LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.projectId = projectId;
        this.projectName = projectName;
        this.suiteId = suiteId;
        this.suiteName = suiteName;
        this.assignedToUserId = assignedToUserId;
        this.assignedToUsername = assignedToUsername;
        this.status = status;
        this.startDate = startDate;
        this.endDate = endDate;
        this.createdByUserId = createdByUserId;
        this.createdByUsername = createdByUsername;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Long getProjectId() {
        return projectId;
    }

    public void setProjectId(Long projectId) {
        this.projectId = projectId;
    }

    public String getProjectName() {
        return projectName;
    }

    public void setProjectName(String projectName) {
        this.projectName = projectName;
    }

    public Long getSuiteId() {
        return suiteId;
    }

    public void setSuiteId(Long suiteId) {
        this.suiteId = suiteId;
    }

    public String getSuiteName() {
        return suiteName;
    }

    public void setSuiteName(String suiteName) {
        this.suiteName = suiteName;
    }

    public Long getAssignedToUserId() {
        return assignedToUserId;
    }

    public void setAssignedToUserId(Long assignedToUserId) {
        this.assignedToUserId = assignedToUserId;
    }

    public String getAssignedToUsername() {
        return assignedToUsername;
    }

    public void setAssignedToUsername(String assignedToUsername) {
        this.assignedToUsername = assignedToUsername;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDateTime startDate) {
        this.startDate = startDate;
    }

    public LocalDateTime getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDateTime endDate) {
        this.endDate = endDate;
    }

    public Long getCreatedByUserId() {
        return createdByUserId;
    }

    public void setCreatedByUserId(Long createdByUserId) {
        this.createdByUserId = createdByUserId;
    }

    public String getCreatedByUsername() {
        return createdByUsername;
    }

    public void setCreatedByUsername(String createdByUsername) {
        this.createdByUsername = createdByUsername;
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

    public Integer getTotalTestCases() {
        return totalTestCases;
    }

    public void setTotalTestCases(Integer totalTestCases) {
        this.totalTestCases = totalTestCases;
    }

    public Integer getPassedCount() {
        return passedCount;
    }

    public void setPassedCount(Integer passedCount) {
        this.passedCount = passedCount;
    }

    public Integer getFailedCount() {
        return failedCount;
    }

    public void setFailedCount(Integer failedCount) {
        this.failedCount = failedCount;
    }

    public Integer getBlockedCount() {
        return blockedCount;
    }

    public void setBlockedCount(Integer blockedCount) {
        this.blockedCount = blockedCount;
    }

    public Integer getSkippedCount() {
        return skippedCount;
    }

    public void setSkippedCount(Integer skippedCount) {
        this.skippedCount = skippedCount;
    }

    public Integer getNotExecutedCount() {
        return notExecutedCount;
    }

    public void setNotExecutedCount(Integer notExecutedCount) {
        this.notExecutedCount = notExecutedCount;
    }
}
