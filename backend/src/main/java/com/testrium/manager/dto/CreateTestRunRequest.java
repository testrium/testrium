package com.testrium.manager.dto;

import java.util.List;

public class CreateTestRunRequest {
    private String name;
    private String description;
    private Long projectId;
    private Long moduleId;
    private Long assignedToUserId;
    private List<Long> testCaseIds;

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

    public Long getModuleId() {
        return moduleId;
    }

    public void setModuleId(Long moduleId) {
        this.moduleId = moduleId;
    }

    public Long getAssignedToUserId() {
        return assignedToUserId;
    }

    public void setAssignedToUserId(Long assignedToUserId) {
        this.assignedToUserId = assignedToUserId;
    }

    public List<Long> getTestCaseIds() {
        return testCaseIds;
    }

    public void setTestCaseIds(List<Long> testCaseIds) {
        this.testCaseIds = testCaseIds;
    }
}
