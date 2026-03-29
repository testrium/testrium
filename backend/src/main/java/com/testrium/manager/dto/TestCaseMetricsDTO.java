package com.testrium.manager.dto;

public class TestCaseMetricsDTO {

    // Identifiers
    private Long entityId;
    private String entityName;
    private String entityType; // MODULE, APPLICATION, PROJECT

    // Total counts
    private int totalTestCases;
    private int activeTestCases;
    private int draftTestCases;
    private int deprecatedTestCases;

    // Automation metrics
    private int automatedTestCases;
    private int manualTestCases;
    private double automationPercentage;

    // Regression metrics
    private int regressionTestCases;
    private int nonRegressionTestCases;
    private double regressionPercentage;

    // Priority breakdown
    private int lowPriority;
    private int mediumPriority;
    private int highPriority;
    private int criticalPriority;

    public TestCaseMetricsDTO() {
    }

    // Getters and Setters
    public Long getEntityId() {
        return entityId;
    }

    public void setEntityId(Long entityId) {
        this.entityId = entityId;
    }

    public String getEntityName() {
        return entityName;
    }

    public void setEntityName(String entityName) {
        this.entityName = entityName;
    }

    public String getEntityType() {
        return entityType;
    }

    public void setEntityType(String entityType) {
        this.entityType = entityType;
    }

    public int getTotalTestCases() {
        return totalTestCases;
    }

    public void setTotalTestCases(int totalTestCases) {
        this.totalTestCases = totalTestCases;
    }

    public int getActiveTestCases() {
        return activeTestCases;
    }

    public void setActiveTestCases(int activeTestCases) {
        this.activeTestCases = activeTestCases;
    }

    public int getDraftTestCases() {
        return draftTestCases;
    }

    public void setDraftTestCases(int draftTestCases) {
        this.draftTestCases = draftTestCases;
    }

    public int getDeprecatedTestCases() {
        return deprecatedTestCases;
    }

    public void setDeprecatedTestCases(int deprecatedTestCases) {
        this.deprecatedTestCases = deprecatedTestCases;
    }

    public int getAutomatedTestCases() {
        return automatedTestCases;
    }

    public void setAutomatedTestCases(int automatedTestCases) {
        this.automatedTestCases = automatedTestCases;
    }

    public int getManualTestCases() {
        return manualTestCases;
    }

    public void setManualTestCases(int manualTestCases) {
        this.manualTestCases = manualTestCases;
    }

    public double getAutomationPercentage() {
        return automationPercentage;
    }

    public void setAutomationPercentage(double automationPercentage) {
        this.automationPercentage = automationPercentage;
    }

    public int getRegressionTestCases() {
        return regressionTestCases;
    }

    public void setRegressionTestCases(int regressionTestCases) {
        this.regressionTestCases = regressionTestCases;
    }

    public int getNonRegressionTestCases() {
        return nonRegressionTestCases;
    }

    public void setNonRegressionTestCases(int nonRegressionTestCases) {
        this.nonRegressionTestCases = nonRegressionTestCases;
    }

    public double getRegressionPercentage() {
        return regressionPercentage;
    }

    public void setRegressionPercentage(double regressionPercentage) {
        this.regressionPercentage = regressionPercentage;
    }

    public int getLowPriority() {
        return lowPriority;
    }

    public void setLowPriority(int lowPriority) {
        this.lowPriority = lowPriority;
    }

    public int getMediumPriority() {
        return mediumPriority;
    }

    public void setMediumPriority(int mediumPriority) {
        this.mediumPriority = mediumPriority;
    }

    public int getHighPriority() {
        return highPriority;
    }

    public void setHighPriority(int highPriority) {
        this.highPriority = highPriority;
    }

    public int getCriticalPriority() {
        return criticalPriority;
    }

    public void setCriticalPriority(int criticalPriority) {
        this.criticalPriority = criticalPriority;
    }
}
