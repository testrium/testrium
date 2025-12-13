package com.pramana.manager.dto;

import com.pramana.manager.entity.AutomationComment;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

public class AutomationCommentDTO {

    private Long id;

    @NotNull(message = "Test case ID is required")
    private Long testCaseId;

    @NotBlank(message = "Comment is required")
    private String comment;

    private AutomationComment.AutomationStatus automationStatus;

    private Long createdById;
    private String createdByUsername;
    private LocalDateTime createdAt;
    private Boolean isCurrent;

    public AutomationCommentDTO() {
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getTestCaseId() {
        return testCaseId;
    }

    public void setTestCaseId(Long testCaseId) {
        this.testCaseId = testCaseId;
    }

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }

    public AutomationComment.AutomationStatus getAutomationStatus() {
        return automationStatus;
    }

    public void setAutomationStatus(AutomationComment.AutomationStatus automationStatus) {
        this.automationStatus = automationStatus;
    }

    public Long getCreatedById() {
        return createdById;
    }

    public void setCreatedById(Long createdById) {
        this.createdById = createdById;
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

    public Boolean getIsCurrent() {
        return isCurrent;
    }

    public void setIsCurrent(Boolean isCurrent) {
        this.isCurrent = isCurrent;
    }
}
