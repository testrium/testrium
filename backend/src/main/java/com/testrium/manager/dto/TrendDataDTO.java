package com.testrium.manager.dto;

import java.time.LocalDateTime;

public class TrendDataDTO {
    private LocalDateTime date;
    private String testRunName;
    private Long testRunId;
    private Long totalTests;
    private Long passedTests;
    private Long failedTests;
    private Long skippedTests;
    private Double passRate;

    public TrendDataDTO() {}

    public TrendDataDTO(LocalDateTime date, String testRunName, Long testRunId,
                        Long totalTests, Long passedTests, Long failedTests,
                        Long skippedTests, Double passRate) {
        this.date = date;
        this.testRunName = testRunName;
        this.testRunId = testRunId;
        this.totalTests = totalTests;
        this.passedTests = passedTests;
        this.failedTests = failedTests;
        this.skippedTests = skippedTests;
        this.passRate = passRate;
    }

    // Getters and Setters
    public LocalDateTime getDate() {
        return date;
    }

    public void setDate(LocalDateTime date) {
        this.date = date;
    }

    public String getTestRunName() {
        return testRunName;
    }

    public void setTestRunName(String testRunName) {
        this.testRunName = testRunName;
    }

    public Long getTestRunId() {
        return testRunId;
    }

    public void setTestRunId(Long testRunId) {
        this.testRunId = testRunId;
    }

    public Long getTotalTests() {
        return totalTests;
    }

    public void setTotalTests(Long totalTests) {
        this.totalTests = totalTests;
    }

    public Long getPassedTests() {
        return passedTests;
    }

    public void setPassedTests(Long passedTests) {
        this.passedTests = passedTests;
    }

    public Long getFailedTests() {
        return failedTests;
    }

    public void setFailedTests(Long failedTests) {
        this.failedTests = failedTests;
    }

    public Long getSkippedTests() {
        return skippedTests;
    }

    public void setSkippedTests(Long skippedTests) {
        this.skippedTests = skippedTests;
    }

    public Double getPassRate() {
        return passRate;
    }

    public void setPassRate(Double passRate) {
        this.passRate = passRate;
    }
}
