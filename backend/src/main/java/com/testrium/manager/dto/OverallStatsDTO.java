package com.testrium.manager.dto;

import java.util.List;

public class OverallStatsDTO {
    private Long totalProjects;
    private Long totalTestCases;
    private Long totalTestRuns;
    private Long totalExecutions;
    private Long passedExecutions;
    private Long failedExecutions;
    private Long skippedExecutions;
    private Double overallPassRate;
    private List<ProjectStatsDTO> projectStats;

    public OverallStatsDTO() {}

    public OverallStatsDTO(Long totalProjects, Long totalTestCases, Long totalTestRuns,
                          Long totalExecutions, Long passedExecutions, Long failedExecutions,
                          Long skippedExecutions, Double overallPassRate, List<ProjectStatsDTO> projectStats) {
        this.totalProjects = totalProjects;
        this.totalTestCases = totalTestCases;
        this.totalTestRuns = totalTestRuns;
        this.totalExecutions = totalExecutions;
        this.passedExecutions = passedExecutions;
        this.failedExecutions = failedExecutions;
        this.skippedExecutions = skippedExecutions;
        this.overallPassRate = overallPassRate;
        this.projectStats = projectStats;
    }

    public Long getTotalProjects() { return totalProjects; }
    public void setTotalProjects(Long totalProjects) { this.totalProjects = totalProjects; }

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

    public Double getOverallPassRate() { return overallPassRate; }
    public void setOverallPassRate(Double overallPassRate) { this.overallPassRate = overallPassRate; }

    public List<ProjectStatsDTO> getProjectStats() { return projectStats; }
    public void setProjectStats(List<ProjectStatsDTO> projectStats) { this.projectStats = projectStats; }
}
