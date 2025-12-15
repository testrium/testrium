package com.pramana.manager.dto;

public class TestCaseImportRow {
    private String id;  // TestRail ID (optional, for reference)
    private String title;
    private String automationType;
    private String createdBy;
    private String section;  // Maps to Module
    private String steps;
    private String description;
    private String preconditions;
    private String expectedResult;
    private String priority;
    private String type;
    private String isAutomated;
    private String isRegression;

    public TestCaseImportRow() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getAutomationType() { return automationType; }
    public void setAutomationType(String automationType) { this.automationType = automationType; }
    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }
    public String getSection() { return section; }
    public void setSection(String section) { this.section = section; }
    public String getSteps() { return steps; }
    public void setSteps(String steps) { this.steps = steps; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getPreconditions() { return preconditions; }
    public void setPreconditions(String preconditions) { this.preconditions = preconditions; }
    public String getExpectedResult() { return expectedResult; }
    public void setExpectedResult(String expectedResult) { this.expectedResult = expectedResult; }
    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public String getIsAutomated() { return isAutomated; }
    public void setIsAutomated(String isAutomated) { this.isAutomated = isAutomated; }
    public String getIsRegression() { return isRegression; }
    public void setIsRegression(String isRegression) { this.isRegression = isRegression; }
}
