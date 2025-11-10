package com.pramana.manager.dto;

public class ProjectMemberDTO {
    private Long id;
    private Long projectId;
    private String projectName;
    private Long userId;
    private String username;
    private String email;
    private String role;

    public ProjectMemberDTO() {}

    public ProjectMemberDTO(Long id, Long projectId, String projectName, Long userId, String username, String email, String role) {
        this.id = id;
        this.projectId = projectId;
        this.projectName = projectName;
        this.userId = userId;
        this.username = username;
        this.email = email;
        this.role = role;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getProjectId() { return projectId; }
    public void setProjectId(Long projectId) { this.projectId = projectId; }

    public String getProjectName() { return projectName; }
    public void setProjectName(String projectName) { this.projectName = projectName; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
}
