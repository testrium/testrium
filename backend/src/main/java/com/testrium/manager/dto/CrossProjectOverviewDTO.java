package com.testrium.manager.dto;

import java.util.List;

public class CrossProjectOverviewDTO {

    // Global KPIs
    private int totalProjects;
    private int totalTestCases;
    private int totalTestRuns;
    private int totalUsers;
    private double overallPassRate;

    // Test run status counts across all projects
    private int runsPassed;
    private int runsFailed;
    private int runsInProgress;
    private int runsNotStarted;

    // Test case priority breakdown across all projects
    private int priorityLow;
    private int priorityMedium;
    private int priorityHigh;
    private int priorityCritical;

    // Automation breakdown
    private int automatedCases;
    private int manualCases;

    // Per-project summaries
    private List<ProjectSummary> projects;

    // Recent test runs (last 10 across all projects)
    private List<RecentRun> recentRuns;

    public static class ProjectSummary {
        private Long projectId;
        private String projectName;
        private String projectStatus;
        private int testCaseCount;
        private int testRunCount;
        private int passedRuns;
        private int failedRuns;
        private int inProgressRuns;
        private double passRate;

        public Long getProjectId() { return projectId; }
        public void setProjectId(Long projectId) { this.projectId = projectId; }
        public String getProjectName() { return projectName; }
        public void setProjectName(String projectName) { this.projectName = projectName; }
        public String getProjectStatus() { return projectStatus; }
        public void setProjectStatus(String projectStatus) { this.projectStatus = projectStatus; }
        public int getTestCaseCount() { return testCaseCount; }
        public void setTestCaseCount(int testCaseCount) { this.testCaseCount = testCaseCount; }
        public int getTestRunCount() { return testRunCount; }
        public void setTestRunCount(int testRunCount) { this.testRunCount = testRunCount; }
        public int getPassedRuns() { return passedRuns; }
        public void setPassedRuns(int passedRuns) { this.passedRuns = passedRuns; }
        public int getFailedRuns() { return failedRuns; }
        public void setFailedRuns(int failedRuns) { this.failedRuns = failedRuns; }
        public int getInProgressRuns() { return inProgressRuns; }
        public void setInProgressRuns(int inProgressRuns) { this.inProgressRuns = inProgressRuns; }
        public double getPassRate() { return passRate; }
        public void setPassRate(double passRate) { this.passRate = passRate; }
    }

    public static class RecentRun {
        private Long runId;
        private String runName;
        private String projectName;
        private String status;
        private String assignedTo;
        private String createdAt;

        public Long getRunId() { return runId; }
        public void setRunId(Long runId) { this.runId = runId; }
        public String getRunName() { return runName; }
        public void setRunName(String runName) { this.runName = runName; }
        public String getProjectName() { return projectName; }
        public void setProjectName(String projectName) { this.projectName = projectName; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public String getAssignedTo() { return assignedTo; }
        public void setAssignedTo(String assignedTo) { this.assignedTo = assignedTo; }
        public String getCreatedAt() { return createdAt; }
        public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
    }

    // Global KPI getters/setters
    public int getTotalProjects() { return totalProjects; }
    public void setTotalProjects(int totalProjects) { this.totalProjects = totalProjects; }
    public int getTotalTestCases() { return totalTestCases; }
    public void setTotalTestCases(int totalTestCases) { this.totalTestCases = totalTestCases; }
    public int getTotalTestRuns() { return totalTestRuns; }
    public void setTotalTestRuns(int totalTestRuns) { this.totalTestRuns = totalTestRuns; }
    public int getTotalUsers() { return totalUsers; }
    public void setTotalUsers(int totalUsers) { this.totalUsers = totalUsers; }
    public double getOverallPassRate() { return overallPassRate; }
    public void setOverallPassRate(double overallPassRate) { this.overallPassRate = overallPassRate; }
    public int getRunsPassed() { return runsPassed; }
    public void setRunsPassed(int runsPassed) { this.runsPassed = runsPassed; }
    public int getRunsFailed() { return runsFailed; }
    public void setRunsFailed(int runsFailed) { this.runsFailed = runsFailed; }
    public int getRunsInProgress() { return runsInProgress; }
    public void setRunsInProgress(int runsInProgress) { this.runsInProgress = runsInProgress; }
    public int getRunsNotStarted() { return runsNotStarted; }
    public void setRunsNotStarted(int runsNotStarted) { this.runsNotStarted = runsNotStarted; }
    public int getPriorityLow() { return priorityLow; }
    public void setPriorityLow(int priorityLow) { this.priorityLow = priorityLow; }
    public int getPriorityMedium() { return priorityMedium; }
    public void setPriorityMedium(int priorityMedium) { this.priorityMedium = priorityMedium; }
    public int getPriorityHigh() { return priorityHigh; }
    public void setPriorityHigh(int priorityHigh) { this.priorityHigh = priorityHigh; }
    public int getPriorityCritical() { return priorityCritical; }
    public void setPriorityCritical(int priorityCritical) { this.priorityCritical = priorityCritical; }
    public int getAutomatedCases() { return automatedCases; }
    public void setAutomatedCases(int automatedCases) { this.automatedCases = automatedCases; }
    public int getManualCases() { return manualCases; }
    public void setManualCases(int manualCases) { this.manualCases = manualCases; }
    public List<ProjectSummary> getProjects() { return projects; }
    public void setProjects(List<ProjectSummary> projects) { this.projects = projects; }
    public List<RecentRun> getRecentRuns() { return recentRuns; }
    public void setRecentRuns(List<RecentRun> recentRuns) { this.recentRuns = recentRuns; }
}
