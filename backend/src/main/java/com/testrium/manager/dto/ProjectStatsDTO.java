package com.testrium.manager.dto;

public class ProjectStatsDTO {
    private Long projectId;
    private String projectName;
    private Long totalTestCases;
    private Long totalTestRuns;
    private Long totalExecutions;
    private Long passedExecutions;
    private Long failedExecutions;
    private Long skippedExecutions;
    private Double passRate;

    public ProjectStatsDTO() {}

    public ProjectStatsDTO(Long projectId, String projectName, Long totalTestCases, Long totalTestRuns,
                          Long totalExecutions, Long passedExecutions, Long failedExecutions,
                          Long skippedExecutions, Double passRate) {
        this.projectId = projectId;
        this.projectName = projectName;
        this.totalTestCases = totalTestCases;
        this.totalTestRuns = totalTestRuns;
        this.totalExecutions = totalExecutions;
        this.passedExecutions = passedExecutions;
        this.failedExecutions = failedExecutions;
        this.skippedExecutions = skippedExecutions;
        this.passRate = passRate;
    }

    public Long getProjectId() { return projectId; }
    public void setProjectId(Long projectId) { this.projectId = projectId; }

    public String getProjectName() { return projectName; }
    public void setProjectName(String projectName) { this.projectName = projectName; }

    public Long getTotalTestCases() { return totalTestCases; }
    public void setTotalTestCases(Long totalTestCases) { this.totalTestCases = totalTestCases; }

    public Long getTotalTestRuns() { return totalTestRuns; }
    public void setTotalTestRuns(Long totalTestRuns) { this.totalTestRuns = totalTestRuns; }

    public Long getTotalExecutions() { return totalExecutions; }
    public void setTotalExecutions(Long totalExecutions) { this.totalExecutions = totalExecutions; }

    public Long getPassedExecutions() { return passedExecutions; }
    public void setPassedExecutions(Long passedExecutions) { this.passedExecutions = passedExecutions; }

    public Long getFailedExecutions() { return failedExecutions; }
    public void setFailedExecutions(Long failedExecutions) { this.failedExecutions = failedExecutions; }

    public Long getSkippedExecutions() { return skippedExecutions; }
    public void setSkippedExecutions(Long skippedExecutions) { this.skippedExecutions = skippedExecutions; }

    public Double getPassRate() { return passRate; }
    public void setPassRate(Double passRate) { this.passRate = passRate; }
}
