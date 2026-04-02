package com.testrium.manager.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "project_webhook_configs")
public class ProjectWebhookConfig {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private Long projectId;

    @Column(length = 1000)
    private String slackWebhookUrl;

    @Column(length = 1000)
    private String teamsWebhookUrl;

    private Boolean notifyOnAssigned = true;
    private Boolean notifyOnCompleted = true;
    private Boolean enabled = true;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (enabled == null) enabled = true;
        if (notifyOnAssigned == null) notifyOnAssigned = true;
        if (notifyOnCompleted == null) notifyOnCompleted = true;
    }

    @PreUpdate
    protected void onUpdate() { updatedAt = LocalDateTime.now(); }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getProjectId() { return projectId; }
    public void setProjectId(Long projectId) { this.projectId = projectId; }
    public String getSlackWebhookUrl() { return slackWebhookUrl; }
    public void setSlackWebhookUrl(String slackWebhookUrl) { this.slackWebhookUrl = slackWebhookUrl; }
    public String getTeamsWebhookUrl() { return teamsWebhookUrl; }
    public void setTeamsWebhookUrl(String teamsWebhookUrl) { this.teamsWebhookUrl = teamsWebhookUrl; }
    public Boolean getNotifyOnAssigned() { return notifyOnAssigned; }
    public void setNotifyOnAssigned(Boolean notifyOnAssigned) { this.notifyOnAssigned = notifyOnAssigned; }
    public Boolean getNotifyOnCompleted() { return notifyOnCompleted; }
    public void setNotifyOnCompleted(Boolean notifyOnCompleted) { this.notifyOnCompleted = notifyOnCompleted; }
    public Boolean getEnabled() { return enabled; }
    public void setEnabled(Boolean enabled) { this.enabled = enabled; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
