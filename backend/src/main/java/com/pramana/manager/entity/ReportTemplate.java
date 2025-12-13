package com.pramana.manager.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "report_templates")
public class ReportTemplate {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "created_by_user_id", nullable = false)
    private Long createdByUserId;

    @Column(name = "project_id")
    private Long projectId;

    @Column(name = "include_overall_stats")
    private Boolean includeOverallStats = true;

    @Column(name = "include_project_stats")
    private Boolean includeProjectStats = true;

    @Column(name = "include_test_run_details")
    private Boolean includeTestRunDetails = true;

    @Column(name = "include_trend_analysis")
    private Boolean includeTrendAnalysis = false;

    @Column(name = "include_charts")
    private Boolean includeCharts = true;

    @Column(name = "export_format")
    private String exportFormat = "PDF"; // PDF, EXCEL, BOTH

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
    public ReportTemplate() {}

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

    public Long getProjectId() {
        return projectId;
    }

    public void setProjectId(Long projectId) {
        this.projectId = projectId;
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
