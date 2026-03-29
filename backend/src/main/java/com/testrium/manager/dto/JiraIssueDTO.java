package com.testrium.manager.dto;

import lombok.Data;

@Data
public class JiraIssueDTO {
    // Request fields
    private Long testExecutionId;
    private String summary;
    private String description;
    private String issueType; // Bug, Task, etc.
    private String priority; // High, Medium, Low
    private String assigneeEmail; // Optional JIRA user email

    // Response fields
    private String jiraIssueKey; // e.g., BUG-123
    private String jiraIssueUrl;
    private String status; // Created, Failed
    private String errorMessage;
}
