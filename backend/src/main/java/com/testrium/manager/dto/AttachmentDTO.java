package com.testrium.manager.dto;

import java.time.LocalDateTime;

public class AttachmentDTO {
    private Long id;
    private Long testExecutionId;
    private String originalName;
    private Long fileSize;
    private String contentType;
    private String uploadedByUsername;
    private LocalDateTime createdAt;

    public AttachmentDTO() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getTestExecutionId() { return testExecutionId; }
    public void setTestExecutionId(Long testExecutionId) { this.testExecutionId = testExecutionId; }
    public String getOriginalName() { return originalName; }
    public void setOriginalName(String originalName) { this.originalName = originalName; }
    public Long getFileSize() { return fileSize; }
    public void setFileSize(Long fileSize) { this.fileSize = fileSize; }
    public String getContentType() { return contentType; }
    public void setContentType(String contentType) { this.contentType = contentType; }
    public String getUploadedByUsername() { return uploadedByUsername; }
    public void setUploadedByUsername(String uploadedByUsername) { this.uploadedByUsername = uploadedByUsername; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
