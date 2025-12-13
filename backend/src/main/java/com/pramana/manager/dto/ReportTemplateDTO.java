package com.pramana.manager.dto;

import java.time.LocalDateTime;

public class ReportTemplateDTO {
    private Long id;
    private String name;
    private String description;
    private Long createdByUserId;
    private String createdByUsername;
    private Long projectId;
    private String projectName;
    private Boolean includeOverallStats;
    private Boolean includeProjectStats;
    private Boolean includeTestRunDetails;
    private Boolean includeTrendAnalysis;
    private Boolean includeCharts;
    private String exportFormat;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Constructors
    public ReportTemplateDTO() {}

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

    public Boolean getIncludeOverallStats() {
        return includeOverallStats;
    }

    public void setIncludeOverallStats(Boolean includeOverallStats) {
        this.includeOverallStats = includeOverallStats;
    }

    public Boolean getIncludeProjectStats() {
        return includeProjectStats;
    }

    public void setIncludeProjectStats(Boolean includeProjectStats) {
        this.includeProjectStats = includeProjectStats;
    }

    public Boolean getIncludeTestRunDetails() {
        return includeTestRunDetails;
    }

    public void setIncludeTestRunDetails(Boolean includeTestRunDetails) {
        this.includeTestRunDetails = includeTestRunDetails;
    }

    public Boolean getIncludeTrendAnalysis() {
        return includeTrendAnalysis;
    }

    public void setIncludeTrendAnalysis(Boolean includeTrendAnalysis) {
        this.includeTrendAnalysis = includeTrendAnalysis;
    }

    public Boolean getIncludeCharts() {
        return includeCharts;
    }

    public void setIncludeCharts(Boolean includeCharts) {
        this.includeCharts = includeCharts;
    }

    public String getExportFormat() {
        return exportFormat;
    }

    public void setExportFormat(String exportFormat) {
        this.exportFormat = exportFormat;
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
