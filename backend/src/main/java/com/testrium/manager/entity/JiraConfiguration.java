package com.testrium.manager.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "jira_configurations")
@Data
public class JiraConfiguration {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private Long projectId;

    @Column(nullable = false)
    private String jiraUrl; // e.g., https://yourcompany.atlassian.net

    @Column(nullable = false)
    private String jiraProjectKey; // e.g., BUG, PROJ

    @Column(nullable = false)
    private String jiraUsername; // Service account email

    @Column(nullable = false, length = 500)
    private String jiraApiToken; // Encrypted API token

    private String defaultIssueType; // Bug, Defect, Task

    private String defaultPriority; // High, Medium, Low

    private Boolean enableUserMapping; // Map Pramana users to JIRA users

    @Column(columnDefinition = "TEXT")
    private String userMappings; // JSON string of user mappings

    private Boolean isEnabled;

    private Long createdByUserId;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        isEnabled = true;
        if (enableUserMapping == null) {
            enableUserMapping = false;
        }
        if (defaultIssueType == null) {
            defaultIssueType = "Bug";
        }
        if (defaultPriority == null) {
            defaultPriority = "Medium";
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
