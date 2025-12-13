package com.pramana.manager.dto;

import com.pramana.manager.entity.TestCase;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

public class TestCaseDTO {

    private Long id;

    @NotBlank(message = "Title is required")
    private String title;

    private String description;

    private String preconditions;

    @NotBlank(message = "Steps are required")
    private String steps;

    @NotBlank(message = "Expected result is required")
    private String expectedResult;

    @NotNull(message = "Priority is required")
    private TestCase.Priority priority;

    @NotNull(message = "Status is required")
    private TestCase.TestCaseStatus status;

    @NotNull(message = "Type is required")
    private TestCase.TestType type;

    @NotNull(message = "Project ID is required")
    private Long projectId;

    private Long moduleId;

    private String moduleName;

    private String projectName;

    private String createdByUsername;

    private String updatedByUsername;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    public TestCaseDTO() {
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getPreconditions() {
        return preconditions;
    }

    public void setPreconditions(String preconditions) {
        this.preconditions = preconditions;
    }

    public String getSteps() {
        return steps;
    }

    public void setSteps(String steps) {
        this.steps = steps;
    }

    public String getExpectedResult() {
        return expectedResult;
    }

    public void setExpectedResult(String expectedResult) {
        this.expectedResult = expectedResult;
    }

    public TestCase.Priority getPriority() {
        return priority;
    }

    public void setPriority(TestCase.Priority priority) {
        this.priority = priority;
    }

    public TestCase.TestCaseStatus getStatus() {
        return status;
    }

    public void setStatus(TestCase.TestCaseStatus status) {
        this.status = status;
    }

    public TestCase.TestType getType() {
        return type;
    }

    public void setType(TestCase.TestType type) {
        this.type = type;
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

    public String getModuleName() {
        return moduleName;
    }

    public void setModuleName(String moduleName) {
        this.moduleName = moduleName;
    }

    public String getProjectName() {
        return projectName;
    }

    public void setProjectName(String projectName) {
        this.projectName = projectName;
    }

    public String getCreatedByUsername() {
        return createdByUsername;
    }

    public void setCreatedByUsername(String createdByUsername) {
        this.createdByUsername = createdByUsername;
    }

    public String getUpdatedByUsername() {
        return updatedByUsername;
    }

    public void setUpdatedByUsername(String updatedByUsername) {
        this.updatedByUsername = updatedByUsername;
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
