package com.pramana.manager.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class JiraConfigurationDTO {
    private Long id;
    private Long projectId;
    private String projectName;
    private String jiraUrl;
    private String jiraProjectKey;
    private String jiraUsername;
    private String jiraApiToken; // Will be masked when sending to frontend
    private String defaultIssueType;
    private String defaultPriority;
    private Boolean enableUserMapping;
    private String userMappings; // JSON string
    private Boolean isEnabled;
    private Long createdByUserId;
    private String createdByUsername;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
